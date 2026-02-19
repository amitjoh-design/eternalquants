"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Share2, Flag, Star } from "lucide-react"
import { format } from "date-fns"
import { RatingInput } from "@/components/RatingInput"
import { RatingList } from "@/components/RatingList"
import { toast } from "sonner"

// Mock Data for chart (simplified for now, ideally comes from backend too)
const chartData = [
    { date: '2023-01', value: 100 },
    { date: '2023-02', value: 105 },
    { date: '2023-03', value: 103 },
    { date: '2023-04', value: 108 },
    { date: '2023-05', value: 112 },
    { date: '2023-06', value: 110 },
    { date: '2023-07', value: 115 },
];

interface Model {
    id: string
    title: string
    description: string
    category: string
    created_at: string
    status: string
    profiles: {
        username: string
        avatar_url: string
    }
    model_metrics: any[]
    ratings: any[]
    comments: any[]
    timeseries_name: string
    date_range_start: string
    date_range_end: string
    data_frequency: string
}

export default function ModelDetailPage() {
    const params = useParams()
    const id = params?.id as string
    const [model, setModel] = useState<Model | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchModel = useCallback(async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/models/${id}`)
            if (!res.ok) throw new Error("Failed to fetch model")
            const data = await res.json()
            setModel(data)
        } catch (err) {
            console.error(err)
            setError("Could not load model details")
            toast.error("Could not load model details")
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        if (id) {
            fetchModel()
        }
    }, [id, fetchModel])

    if (loading) return <div className="flex justify-center items-center min-h-[50vh]">Loading...</div>
    if (error || !model) return <div className="flex justify-center items-center min-h-[50vh] text-red-500">{error || "Model not found"}</div>

    // Calculate Average Rating
    const ratings = model.ratings || []
    const avgRating = ratings.length > 0
        ? (ratings.reduce((acc, curr) => acc + curr.score, 0) / ratings.length).toFixed(1)
        : "N/A"

    // Get latest metrics
    const metrics = model.model_metrics?.[0] || {}

    return (
        <div className="container mx-auto py-10 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-3xl font-bold tracking-tight">{model.title}</h1>
                        <Badge>{model.category}</Badge>
                        <Badge variant="outline">{model.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={model.profiles?.avatar_url} />
                                <AvatarFallback>{model.profiles?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">Created by {model.profiles?.username || "Unknown"}</span>
                        </div>
                        <span className="text-sm">• Uploaded on {format(new Date(model.created_at), "PPP")}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
                    <Button variant="outline" size="sm"><Flag className="mr-2 h-4 w-4" /> Report</Button>
                    <Button size="sm"><Download className="mr-2 h-4 w-4" /> Download Code</Button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Charts & detailed info */}
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Equity Curve</CardTitle>
                            <CardDescription>Cumulative returns over the backtest period.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="date" className="text-xs" />
                                    <YAxis className="text-xs" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="description">
                        <TabsList>
                            <TabsTrigger value="description">Description</TabsTrigger>
                            <TabsTrigger value="reviews">Reviews ({ratings.length})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="description" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Strategy Logic</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {model.description || "No description provided."}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Timeseries Info</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-semibold">Dataset:</span> {model.timeseries_name}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Range:</span> {model.date_range_start} to {model.date_range_end}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Frequency:</span> {model.data_frequency}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="reviews" className="mt-4 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Write a Review</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <RatingInput modelId={id} onRatingSubmit={fetchModel} />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Reviews</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <RatingList ratings={ratings} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column - Key Metrics */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-sm text-muted-foreground">Total Return</span>
                                <span className="font-bold text-green-500">{metrics.total_return ? `${metrics.total_return}%` : "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-sm text-muted-foreground">Ann. Return</span>
                                <span className="font-bold text-green-500">{metrics.annualized_return ? `${metrics.annualized_return}%` : "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                                <span className="font-bold">{metrics.sharpe_ratio || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-sm text-muted-foreground">Sortino Ratio</span>
                                <span className="font-bold">{metrics.sortino_ratio || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-sm text-muted-foreground">Max Drawdown</span>
                                <span className="font-bold text-red-500">{metrics.max_drawdown ? `${metrics.max_drawdown}%` : "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-sm text-muted-foreground">Win Rate</span>
                                <span className="font-bold">{metrics.win_rate ? `${metrics.win_rate}%` : "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-sm text-muted-foreground">Profit Factor</span>
                                <span className="font-bold">{metrics.profit_factor || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-sm text-muted-foreground">Total Trades</span>
                                <span className="font-bold">{metrics.total_trades || "N/A"}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Community Rating</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-center items-center mb-4">
                                <span className="text-4xl font-bold mr-2">{avgRating}</span>
                                <div className="flex text-yellow-500">
                                    <Star className="h-6 w-6 fill-current" />
                                </div>
                            </div>
                            <div className="text-center text-sm text-muted-foreground mb-6">
                                Based on {ratings.length} ratings
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
