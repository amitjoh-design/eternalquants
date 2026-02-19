"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

interface RatingInputProps {
    modelId: string
    onRatingSubmit: () => void
}

export function RatingInput({ modelId, onRatingSubmit }: RatingInputProps) {
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hoverRating, setHoverRating] = useState(0)

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Please select a rating")
            return
        }

        setIsSubmitting(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                toast.error("You must be logged in to rate")
                return
            }

            const formData = new FormData()
            formData.append("model_id", modelId)
            formData.append("score", rating.toString())
            if (comment) formData.append("comment", comment)

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/ratings/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: formData
            })

            if (!response.ok) {
                throw new Error("Failed to submit rating")
            }

            toast.success("Rating submitted successfully")
            setRating(0)
            setComment("")
            onRatingSubmit()
        } catch (error) {
            console.error(error)
            toast.error("Failed to submit rating")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Rate this model</h3>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        className="focus:outline-none transition-transform hover:scale-110"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                    >
                        <Star
                            className={`h-6 w-6 ${(hoverRating || rating) >= star
                                    ? "fill-yellow-500 text-yellow-500"
                                    : "text-muted-foreground"
                                }`}
                        />
                    </button>
                ))}
            </div>
            <Textarea
                placeholder="Share your thoughts on this model..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
            />
            <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
        </div>
    )
}
