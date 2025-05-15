"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DebugLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@train4best.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setDebugInfo("Mencoba login...");

    try {
      // Call our debug login API
      const response = await fetch("/api/auth/debug-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setDebugInfo(JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.error || "Terjadi kesalahan saat login");
      }

      if (data.success) {
        setDebugInfo(`Login berhasil! Mengarahkan ke: ${data.redirectTo}`);
        
        // Redirect with a slight delay
        setTimeout(() => {
          window.location.href = data.redirectTo;
        }, 1000);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error instanceof Error ? error.message : "Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Debug Login</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
        
        <div className="mt-4">
          <Link href="/login" className="text-blue-600 hover:underline">
            Kembali ke login normal
          </Link>
        </div>
        
        {debugInfo && (
          <div className="mt-4 p-2 bg-gray-100 rounded-md">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <pre className="text-xs overflow-auto max-h-48">{debugInfo}</pre>
          </div>
        )}
      </div>
    </div>
  );
} 