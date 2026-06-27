import { AuthForm } from "@/components/auth-form";
import { Shell } from "@/components/shell";

export default function RegisterPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-xl">
        <AuthForm mode="register" />
      </div>
    </Shell>
  );
}
