import type { Metadata } from "next";
import { LogForm } from "@/components/LogForm";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Log a holiday" };

export default function LogPage() {
  return (
    <>
      <PageHeader title="Log a holiday" kicker="Welcome home" />
      <p className="-mt-2 mb-6 px-4 text-ink-soft">Rate the place and where you stayed, out of 10.</p>
      <LogForm />
    </>
  );
}
