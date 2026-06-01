import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";
import { NovaLoader } from "@/components/ui/loading/nova-loader";

export const metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <Suspense fallback={<NovaLoader label="Preparing secure registration..." />}>
      <RegisterForm />
    </Suspense>
  );
}
