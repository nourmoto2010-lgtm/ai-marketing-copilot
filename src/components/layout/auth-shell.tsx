"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/app-context";
import { AppSidebar } from "./app-sidebar";
import { TopNavbar } from "./top-navbar";

export function AuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isAuthReady } = useAppStore();

  const isLoginRoute = pathname === "/login";

  useEffect(() => {
    if (!isAuthReady) return;
    if (!isAuthenticated && !isLoginRoute) {
      router.replace("/login");
    }
  }, [isAuthReady, isAuthenticated, isLoginRoute, router]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white text-sm font-bold">
        جاري التحقق من الجلسة...
      </div>
    );
  }

  if (isLoginRoute || !isAuthenticated) {
    return <main className="min-h-screen bg-[#0F172A]">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar />
        <main className="flex-1 p-3 sm:p-6 max-w-[1600px] w-full mx-auto pb-20 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
