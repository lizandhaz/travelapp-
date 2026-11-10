import type { Metadata } from "next";
import { ExploreList } from "@/components/ExploreList";
import { PageHeader } from "@/components/PageHeader";
import { destinations } from "@/lib/data";

export const metadata: Metadata = { title: "Explore" };

export default function ExplorePage() {
  return (
    <>
      <PageHeader title="Explore" kicker="Rated by friends" />
      <ExploreList destinations={destinations} />
    </>
  );
}
