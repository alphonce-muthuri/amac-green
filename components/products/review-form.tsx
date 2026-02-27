"use client"

import { useState, useEffect } from "react"
import { Star, Send, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createReview, updateReview, deleteReview, getUserReview, type Review } from "@/lib/reviews-service"
import { useAuth } from "@/lib/auth-context"

interface ReviewFormProps {
  productId: string
  onReviewSubmitted: () => void
}

export function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (user) {
      loadUserReview()
    }
  }, [user, productId])

  const loadUserReview = async () => {
    const result = await getUserReview(productId, user?.id)
    if (result.success && result.data) {
      setUserReview(result.data)
      setRating(result.data.rating)
      setTitle(result.data.title || "")
      setComment(result.data.comment || "")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    if (!user) {
      setMessage({ type: "error", text: "Please log in to submit a review" })
      setIsSubmitting(false)
      return
    }

    if (rating === 0) {
      setMessage({ type: "error", text: "Please select a rating" })
      setIsSubmitting(false)
      return
    }

    try {
      let result
      if (userReview && isEditing) {
        result = await updateReview(userReview.id, rating, title, comment, user?.id)
      } else {
        result = await createReview(productId, rating, title, comment, user?.id)
      }

      if (result.success) {
        setMessage({ type: "success", text: userReview ? "Review updated successfully!" : "Review submitted successfully!" })
        setIsEditing(false)
        await loadUserReview()
        onReviewSubmitted()
      } else {
        setMessage({ type: "error", text: result.error || "Failed to submit review" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" })
    }

    setIsSubmitting(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
    setMessage(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setMessage(null)
    if (userReview) {
      setRating(userReview.rating)
      setTitle(userReview.title || "")
      setComment(userReview.comment || "")
    } else {
      setRating(0)
      setTitle("")
      setComment("")
    }
  }

  const handleDelete = async () => {
    if (!userReview) return

    if (confirm("Are you sure you want to delete your review?")) {
      setIsSubmitting(true)
      const result = await deleteReview(userReview.id, user?.id)
      
      if (result.success) {
        setUserReview(null)
        setRating(0)
        setTitle("")
        setComment("")
        setIsEditing(false)
        setMessage({ type: "success", text: "Review deleted successfully!" })
        onReviewSubmitted()
      } else {
        setMessage({ type: "error", text: result.error || "Failed to delete review" })
      }
      
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Please log in to write a review for this product.</p>
        </CardContent>
      </Card>
    )
  }

  if (userReview && !isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= userReview.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <Badge variant="secondary">{userReview.rating}/5</Badge>
            </div>
            
            {userReview.title && (
              <div>
                <h4 className="font-medium">{userReview.title}</h4>
              </div>
            )}
            
            {userReview.comment && (
              <p className="text-gray-600">{userReview.comment}</p>
            )}
            
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Review
              </Button>
              <Button size="sm" variant="outline" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Review
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{userReview ? "Edit Your Review" : "Write a Review"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div
              className={`p-3 rounded-md ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-title">Review Title (Optional)</Label>
            <Input
              id="review-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-comment">Review Comment (Optional)</Label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this product..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-sm text-gray-500">{comment.length}/1000 characters</p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || rating === 0}>
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {userReview ? "Update Review" : "Submit Review"}
                </>
              )}
            </Button>
            
            {userReview && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
