import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/dm-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Postcard", template: "%s · Postcard" },
  description: "Holiday ratings from friends you trust. Where they went, where they stayed, what to eat.",
};

export const viewport: Viewport = {
  themeColor: "#f6efe3",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
