"use client"
import Link from "next/link"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export default function UploadPage() {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                toast.error("You must be logged in to upload.")
                setLoading(false)
                return
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/models/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: formData,
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.detail || "Upload failed")
            }

            const data = await res.json()
            toast.success("Model uploaded successfully! Processing started.")
            // Redirect or clear form

        } catch (error: any) {
            toast.error(error.message || "Something went wrong")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-2xl">
            <Card>
                <CardHeader className="relative">
                    <div className="absolute right-4 top-4">
                        <Link href="/models">
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                                <span className="sr-only">Close</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-4 w-4"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </Button>
                        </Link>
                    </div>
                    <CardTitle>Upload Your Strategy</CardTitle>
                    <CardDescription>
                        Submit your Python code and data for evaluation.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Model Title</Label>
                            <Input id="title" name="title" required placeholder="e.g. NIFTY Mean Reversion v1" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" placeholder="Explain your strategy logic..." />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select name="category" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mean_reversion">Mean Reversion</SelectItem>
                                        <SelectItem value="trend_following">Trend Following</SelectItem>
                                        <SelectItem value="arbitrage">Arbitrage</SelectItem>
                                        <SelectItem value="ml_based">ML Based</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="asset_class">Asset Class</Label>
                                <Select name="asset_class" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select asset class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="equity">Equity</SelectItem>
                                        <SelectItem value="crypto">Crypto</SelectItem>
                                        <SelectItem value="forex">Forex</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="timeseries_name">Timeseries Name</Label>
                            <Input id="timeseries_name" name="timeseries_name" placeholder="e.g. NIFTY 50 Daily 2020-2023" required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="python_file">Python Strategy File (.py)</Label>
                                <Input id="python_file" name="python_file" type="file" accept=".py" required />
                                <p className="text-xs text-muted-foreground">Must contain `run_strategy(df)` function.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="data_file">Data File (.csv)</Label>
                                <Input id="data_file" name="data_file" type="file" accept=".csv" required />
                                <p className="text-xs text-muted-foreground">Columns: Date, Open, High, Low, Close, Volume</p>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Uploading..." : "Submit for Evaluation"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
