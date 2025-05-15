import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Clear all auth cookies
    const cookieStore = cookies();
    
    // Clear NextAuth cookies
    cookieStore.delete("next-auth.session-token");
    cookieStore.delete("next-auth.callback-url");
    cookieStore.delete("next-auth.csrf-token");
    
    // Clear debug token
    cookieStore.delete("debug_token");
    
    console.log("All authentication cookies cleared");
    
    return NextResponse.json({ 
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ 
      success: false,
      message: "Error during logout"
    }, { status: 500 });
  }
} 