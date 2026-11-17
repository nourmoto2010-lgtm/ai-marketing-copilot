import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store/app-context";
import { AuthShell } from "@/components/layout/auth-shell";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "نظام إدارة فريق التسويق والمساعد الذكي | AI Marketing Team Copilot & Client Hub",
  description:
    "منصة لإدارة عمليات وكالات وفرق التسويق مدعومة بوكلاء ذكاء اصطناعي لتوزيع المهام، دعم التنفيذ، تقييم أداء الفريق، ومتابعة العملاء.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${inter.variable}`}>
      <body className="antialiased bg-[#F8FAFC] text-[#0F172A] min-h-screen">
        <AppProvider>
          <AuthShell>{children}</AuthShell>
        </AppProvider>
      </body>
    </html>
  );
}
