import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/identity/api/get-current-user";
import { LoginView } from "@/features/identity/components/login-view";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return <LoginView />;
}
