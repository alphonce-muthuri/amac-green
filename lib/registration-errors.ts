import { toFriendlyErrorMessage } from "@/lib/friendly-errors"

export function getFriendlyRegistrationError(rawError?: string): string {
  return toFriendlyErrorMessage(rawError)
}
