"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        // Cek token debug
        const debugResponse = await fetch("/api/auth/verify-debug-token");
        const debugData = await debugResponse.json();
        
        if (debugData.authenticated) {
          console.log("Debug auth OK:", debugData.user);
          const userType = debugData.user.userType?.toLowerCase();
          redirectBasedOnUserType(userType);
          return;
        }
        
        // Cek NextAuth session jika debug token tidak ada
        const response = await fetch("/api/auth/session");
        const session = await response.json();
        
        if (!session?.user) {
          console.log("No session, redirecting to login");
          router.replace("/login");
          return;
        }
        
        const userType = session.user.userType?.toLowerCase();
        redirectBasedOnUserType(userType);
      } catch (error) {
        console.error("Auth check error:", error);
        router.replace("/login");
      }
    }
    
    function redirectBasedOnUserType(userType: string) {
      if (!userType) {
        router.replace("/login");
        return;
      }
      
      switch (userType) {
        case "admin":
          router.replace("/dashboard");
          break;
        case "instructor":
          router.replace("/instructure/dashboard");
          break;
        case "participant":
          router.replace("/participant/dashboard");
          break;
        default:
          router.replace("/login");
      }
    }
    
    checkAuth();
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-4 border-b-4 border-blue-500 mx-auto"></div>
        <p className="text-gray-600">Mengarahkan ke halaman yang sesuai...</p>
      </div>
    </div>
  );
} 