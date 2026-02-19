"use client"
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star } from "lucide-react";

import { useEffect, useState } from "react";

// Define Model interface based on backend response
interface Model {
    id: string;
    title: string;
    category: string;
    model_metrics: {
        sharpe_ratio: number;
        annualized_return: number;
    }[];
    // status: string; // "pending", "completed", "failed"
}

export default function ModelsPage() {
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                // Fetch from our FastAPI backend
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/models/`);
                if (!res.ok) throw new Error("Failed to fetch models");
                const data = await res.json();
                setModels(data);
            } catch (error) {
                console.error("Error fetching models:", error);
                // Fallback to empty or show error state
            } finally {
                setLoading(false);
            }
        };

        fetchModels();
    }, []);
    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Model Marketplace</h1>
                    <p className="text-muted-foreground mt-2">Discover, evaluate, and learn from top quantitative strategies.</p>
                </div>
                <Link href="/upload">
                    <Button>Upload Strategy</Button>
                </Link>
            </div>

            <div className="flex gap-4 mb-8">
                <Input placeholder="Search models..." className="max-w-sm" />
                <Button variant="outline">Filter</Button>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading marketplace...</div>
            ) : models.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">No models found. Be the first to upload one!</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {models.map((model) => {
                        // Safely access metrics (might be missing if pending or failed)
                        const metrics = model.model_metrics && model.model_metrics[0] ? model.model_metrics[0] : { sharpe_ratio: 0, annualized_return: 0 };

                        return (
                            <Card key={model.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg hover:underline decoration-primary truncate" title={model.title}>
                                            <Link href={`/models/${model.id}`}>{model.title}</Link>
                                        </CardTitle>
                                        <Badge variant="outline" className="whitespace-nowrap ml-2">{model.category}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <p className="text-muted-foreground text-xs">Sharpe Ratio</p>
                                            <p className="font-medium">{metrics.sharpe_ratio?.toFixed(2) || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">Ann. Return</p>
                                            <p className={`font-medium ${metrics.annualized_return > 0 ? "text-green-500" : ""}`}>
                                                {metrics.annualized_return ? `+${metrics.annualized_return}%` : "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t pt-4 flex justify-between items-center">
                                    <div className="flex items-center text-yellow-500 text-sm">
                                        <Star className="h-4 w-4 fill-current mr-1" />
                                        {/* Rating implementation pending in frontend fetch */}
                                        4.5
                                    </div>
                                    <Button size="sm" variant="secondary" asChild>
                                        <Link href={`/models/${model.id}`}>View</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
