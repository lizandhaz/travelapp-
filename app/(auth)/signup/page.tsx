import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { signUp } from "../actions";

export const metadata: Metadata = { title: "Join" };

export default function SignupPage() {
  return <AuthForm mode="signup" action={signUp} />;
}
