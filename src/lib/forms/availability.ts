import "server-only";
import { hasDatabase } from "@/lib/firebase/mode";
import { isEmailConfigured } from "@/lib/email/send";

/**
 * Contact/join forms need somewhere to deliver messages: the database, or
 * (no-database mode) email to BOARD_NOTIFICATION_EMAIL. Without either the
 * pages show the contact address instead of a form that would lose input.
 */
export function canAcceptFormMessages(): boolean {
  return (
    hasDatabase() ||
    (isEmailConfigured() && Boolean(process.env.BOARD_NOTIFICATION_EMAIL))
  );
}
