import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Rating {
    id: string
    score: number
    comment: string
    created_at: string
    profiles?: {
        username: string
        avatar_url?: string
    }
}

interface RatingListProps {
    ratings: Rating[]
}

export function RatingList({ ratings }: RatingListProps) {
    if (!ratings || ratings.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No ratings yet. Be the first to rate!
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {ratings.map((rating) => (
                <div key={rating.id} className="flex gap-4">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={rating.profiles?.avatar_url} />
                        <AvatarFallback>
                            {rating.profiles?.username?.substring(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">
                                {rating.profiles?.username || "Unknown User"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true })}
                            </span>
                        </div>
                        <div className="flex text-yellow-500 mb-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < rating.score ? "fill-current" : "text-muted-foreground/30 fill-transparent"
                                        }`}
                                />
                            ))}
                        </div>
                        <p className="text-sm text-foreground/90">{rating.comment}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
