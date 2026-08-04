import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/identity/api/get-current-user";
import { UpdatePasswordView } from "@/features/identity/components/update-password-view";

/**
 * Unlike the other auth pages, this one REQUIRES a session — the password-
 * recovery link authenticates the person before they land here. No session
 * means the link was invalid or expired, so send them back to request a
 * fresh one rather than to /dashboard.
 */
export default async function UpdatePasswordPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/forgot-password");
  return <UpdatePasswordView />;
}
