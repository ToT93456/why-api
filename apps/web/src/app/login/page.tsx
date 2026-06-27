import { AuthForm } from "@/components/auth-form";
import { Shell } from "@/components/shell";

export default function LoginPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-xl">
        <AuthForm mode="login" />
      </div>
    </Shell>
  );
}
