import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<p style={{ margin: 0 }}>Laai…</p>}>
      <LoginForm />
    </Suspense>
  );
}
