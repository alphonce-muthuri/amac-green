export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  title?: string
  comment?: string
  is_verified_purchase: boolean
  helpful_votes: number
  created_at: string
  updated_at: string
}

export async function getProductReviews(productId: string): Promise<{ success: boolean; data?: Review[]; error?: string }> {
  try {
    const response = await fetch(`/api/reviews?productId=${productId}`)
    const result = await response.json()
    
    if (!response.ok) {
      return { success: false, error: result.error || "Failed to fetch reviews" }
    }
    
    return { success: true, data: result.data || [] }
  } catch (error) {
    console.error("Error in getProductReviews:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function createReview(
  productId: string,
  rating: number,
  title?: string,
  comment?: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        rating,
        title,
        comment,
        userId,
      }),
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      return { success: false, error: result.error || "Failed to create review" }
    }
    
    return { success: true }
  } catch (error) {
    console.error("Error in createReview:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updateReview(
  reviewId: string,
  rating: number,
  title?: string,
  comment?: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/reviews/${reviewId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating,
        title,
        comment,
        userId,
      }),
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      return { success: false, error: result.error || "Failed to update review" }
    }
    
    return { success: true }
  } catch (error) {
    console.error("Error in updateReview:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function deleteReview(reviewId: string, userId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/reviews/${reviewId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
      }),
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      return { success: false, error: result.error || "Failed to delete review" }
    }
    
    return { success: true }
  } catch (error) {
    console.error("Error in deleteReview:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getUserReview(productId: string, userId?: string): Promise<{ success: boolean; data?: Review; error?: string }> {
  try {
    const url = userId 
      ? `/api/reviews/user?productId=${productId}&userId=${userId}`
      : `/api/reviews/user?productId=${productId}`
    
    const response = await fetch(url)
    const result = await response.json()
    
    if (!response.ok) {
      return { success: false, error: result.error || "Failed to fetch user review" }
    }
    
    return { success: true, data: result.data || null }
  } catch (error) {
    console.error("Error in getUserReview:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
