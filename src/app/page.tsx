import { redirect } from "next/navigation";

/**
 * Root route. Until Auth (M3) exists there is no session to branch on, so
 * every visitor lands on the dashboard shell for now.
 */
export default function RootPage() {
  redirect("/dashboard");
}
