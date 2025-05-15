"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      console.log("Starting auth check...");
      try {
        // Add a small delay to ensure cookies are properly set
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Cek token debug
        console.log("Checking debug token...");
        const debugResponse = await fetch("/api/auth/verify-debug-token");
        const debugData = await debugResponse.json();
        console.log("Debug token response:", debugData);
        
        if (debugData.authenticated) {
          console.log("Debug auth OK:", debugData.user);
          // Log the exact userType value to debug
          console.log("Debug userType:", debugData.user.userType);
          const userType = debugData.user.userType;
          
          if (userType) {
            setIsLoading(false);
            redirectBasedOnUserType(userType.toLowerCase());
            return;
          } else {
            console.error("No userType in debug token");
            setIsLoading(false);
            router.replace("/login");
            return;
          }
        }
        
        // Cek NextAuth session jika debug token tidak ada
        console.log("Debug token not found, checking NextAuth session...");
        const response = await fetch("/api/auth/session");
        const session = await response.json();
        console.log("NextAuth session response:", session);
        
        if (!session?.user) {
          console.log("No session, redirecting to login");
          setIsLoading(false);
          router.replace("/login");
          return;
        }
        
        // Log the exact userType value to debug
        console.log("Session userType:", session.user.userType);
        const userType = session.user.userType;
        
        if (userType) {
          setIsLoading(false);
          redirectBasedOnUserType(userType.toLowerCase());
        } else {
          console.error("No userType in session");
          setIsLoading(false);
          router.replace("/login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoading(false);
        router.replace("/login");
      }
    }
    
    function redirectBasedOnUserType(userType: string) {
      console.log("Redirecting based on userType:", userType);
      
      switch (userType) {
        case "admin":
          console.log("Redirecting to admin dashboard");
          // Use window.location for a complete page refresh to avoid redirect issues
          window.location.href = "/dashboard";
          break;
        case "instructor":
          console.log("Redirecting to instructor dashboard");
          window.location.href = "/instructure/dashboard";
          break;
        case "participant":
          console.log("Redirecting to participant dashboard");
          window.location.href = "/participant/dashboard";
          break;
        default:
          console.error("Unknown userType:", userType);
          window.location.href = "/login";
      }
    }
    
    checkAuth();
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-4 border-b-4 border-blue-500 mx-auto"></div>
        <p className="text-gray-600">Mengarahkan ke halaman yang sesuai...</p>
        {!isLoading && <p className="text-xs text-gray-400 mt-2">Jika Anda tidak diarahkan secara otomatis, silakan <a href="/login" className="text-blue-500 hover:underline">klik di sini</a></p>}
      </div>
    </div>
  );
} 