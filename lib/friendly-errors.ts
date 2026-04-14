export function toFriendlyErrorMessage(rawError?: string): string {
  const original = (rawError || "").trim()
  const error = original.toLowerCase()

  if (!error) {
    return "Something went wrong. Please try again."
  }

  if (error.includes("violates foreign key constraint") && error.includes("user_id")) {
    return "We couldn't link this request to your account. Please sign out, sign in again, and retry."
  }

  if (error.includes("duplicate key") || error.includes("already exists")) {
    return "This record already exists. Try signing in or using different details."
  }

  if (error.includes("jwt") || error.includes("token") || error.includes("unauthorized")) {
    return "Your session may have expired. Please sign in again and retry."
  }

  if (error.includes("network") || error.includes("fetch") || error.includes("failed to fetch")) {
    return "We couldn't reach the server. Check your internet connection and try again."
  }

  // Preserve already user-friendly messages instead of hiding useful context.
  const technicalMarkers = [
    "violates",
    "constraint",
    "sql",
    "postgres",
    "supabase",
    "foreign key",
    "stack",
    "trace",
    "null value in column",
    "relation",
    "syntax error",
    "unexpected error occurred",
  ]
  const isLikelyTechnical = technicalMarkers.some((marker) => error.includes(marker))

  if (!isLikelyTechnical && original.length <= 220) {
    return original
  }

  return "We couldn't complete your request right now. Please try again."
}
