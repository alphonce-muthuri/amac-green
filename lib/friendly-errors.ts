export function toFriendlyErrorMessage(rawError?: string): string {
  const original = (rawError || "").trim()
  const error = original.toLowerCase()

  if (!error) return "Something went wrong. Please try again."

  // Auth / account
  if (error.includes("already exists") || error.includes("already registered") || error.includes("email already")) {
    return "An account with this email already exists. Try signing in instead."
  }
  if (error.includes("invalid login") || error.includes("invalid credentials") || error.includes("wrong password")) {
    return "Incorrect email or password."
  }
  if (error.includes("email not confirmed") || error.includes("not verified")) {
    return "Please verify your email before signing in. Check your inbox for the verification link."
  }
  if (error.includes("user not found") || error.includes("no user")) {
    return "No account found with that email. Please register first."
  }
  if (error.includes("password") && (error.includes("weak") || error.includes("short") || error.includes("length"))) {
    return "Password must be at least 6 characters long."
  }
  if (
    error.includes("rate limit") ||
    error.includes("too many requests") ||
    error.includes("over_email_send_rate_limit") ||
    error.includes("over_request_rate_limit") ||
    error.includes("for security purposes") ||
    error.includes("request this after")
  ) {
    return "Too many attempts. Please wait a minute before trying again."
  }

  // Session / token
  if (error.includes("jwt expired") || error.includes("token expired")) {
    return "Your session has expired. Please sign in again."
  }
  if (error.includes("jwt") || error.includes("token") || error.includes("unauthorized")) {
    return "Session issue. Please sign in and try again."
  }

  // Database
  if (error.includes("violates foreign key constraint") && error.includes("user_id")) {
    return "Could not link this application to your account. Please try again."
  }
  if (error.includes("duplicate key") || error.includes("unique constraint")) {
    return "A record with these details already exists."
  }
  if (error.includes("null value in column") || error.includes("not-null constraint")) {
    return "Some required fields are missing. Please fill in all required fields."
  }

  // Network / server
  if (error.includes("failed to fetch") || error.includes("network") || error.includes("econnrefused")) {
    return "Connection error. Check your internet and try again."
  }
  if (error.includes("timeout") || error.includes("timed out")) {
    return "The request timed out. Please try again."
  }
  if (error.includes("service") && (error.includes("unavailable") || error.includes("503"))) {
    return "Service temporarily unavailable. Please try again shortly."
  }

  // Passthrough clean messages, block technical noise
  const technicalMarkers = [
    "violates", "constraint", "postgres", "supabase", "foreign key",
    "stack", "trace", "relation", "syntax error", "pgcode", "pgerror",
  ]
  const isTechnical = technicalMarkers.some((m) => error.includes(m))

  if (!isTechnical && original.length <= 220) return original

  return "Something went wrong. Please try again."
}
