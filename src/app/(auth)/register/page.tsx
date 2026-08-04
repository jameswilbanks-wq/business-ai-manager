import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/identity/api/get-current-user";
import { RegisterView } from "@/features/identity/components/register-view";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return <RegisterView />;
}
