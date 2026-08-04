import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/identity/api/get-current-user";
import { VerifyEmailView } from "@/features/identity/components/verify-email-view";

export default async function VerifyEmailPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return <VerifyEmailView />;
}
