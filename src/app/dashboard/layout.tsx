"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        // Cek token debug
        const debugResponse = await fetch("/api/auth/verify-debug-token");
        const debugData = await debugResponse.json();
        
        if (debugData.authenticated) {
          console.log("Debug authentication successful:", debugData.user);
          setDebugInfo(`Auth berhasil sebagai: ${debugData.user.userType}`);
          setLoading(false);
          return;
        }
        
        // Cek NextAuth session jika debug token tidak ada
        const response = await fetch("/api/auth/session");
        const session = await response.json();
        
        if (!session?.user) {
          console.log("No session found, redirecting to login");
          router.replace("/login");
          return;
        }
        
        const userType = session.user.userType;
        if (userType !== "admin") {
          console.log(`User type ${userType} not allowed in admin dashboard`);
          const redirectPath = 
            userType === "instructor" ? "/instructure/dashboard" : "/participant/dashboard";
          router.replace(redirectPath);
          return;
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        router.replace("/login");
      }
    }
    
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-4 border-b-4 border-blue-500 mx-auto"></div>
          <p className="text-gray-600">Memuat...</p>
          {debugInfo && (
            <div className="mt-2 text-green-600 text-sm">{debugInfo}</div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 