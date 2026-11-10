import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileView } from "@/components/ProfileView";
import { getPerson, people } from "@/lib/data";

export function generateStaticParams() {
  return people.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  return { title: getPerson(handle)?.name ?? "Profile" };
}

export default async function PersonPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const person = getPerson(handle);
  if (!person) notFound();
  return <ProfileView person={person} />;
}
