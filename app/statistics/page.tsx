"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StatisticsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the combined report page
    router.push("/report");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50/50 to-cyan-50/50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to report...</p>
      </div>
    </div>
  );
}
