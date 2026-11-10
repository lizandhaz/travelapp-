import { BottomNav } from "@/components/BottomNav";
import { unreadPostcardCount } from "@/lib/data";

// Frame for every in-app screen: a phone-width column with the bottom tab bar.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="mx-auto min-h-dvh max-w-md pb-28">{children}</main>
      <BottomNav unread={unreadPostcardCount()} />
    </>
  );
}
