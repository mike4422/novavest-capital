import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { NovaLoader } from "@/components/ui/loading/nova-loader";

export const metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <Suspense fallback={<NovaLoader label="Preparing secure login..." />}>
      <LoginForm />
    </Suspense>
  );
}
