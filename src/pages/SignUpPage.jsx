import { SignUp } from '@clerk/clerk-react';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/app"
      />
    </div>
  );
}