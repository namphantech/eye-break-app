"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { registerServiceWorker } from "@/lib/notifications";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50/50 to-cyan-50/50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
