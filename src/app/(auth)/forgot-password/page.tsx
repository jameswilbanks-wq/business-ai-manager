import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/identity/api/get-current-user";
import { ForgotPasswordView } from "@/features/identity/components/forgot-password-view";

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return <ForgotPasswordView />;
}
