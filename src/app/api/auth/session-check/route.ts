import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decode } from "jsonwebtoken";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

// Fungsi untuk logging ke file
const logToFile = (message: string) => {
  if (process.env.NODE_ENV === 'development') {
    try {
      const timestamp = new Date().toISOString();
      const logMessage = `${timestamp} - ${message}\n`;
      const logPath = path.join(process.cwd(), 'tmp', 'log', 'session.log');
      fs.appendFileSync(logPath, logMessage);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }
};

export async function GET(req: Request) {
  const sessionId = req.headers.get('x-session-id') || 'unknown';
  logToFile(`Session check requested: ${sessionId}`);
  
  try {
    // Get session from next-auth
    const session = await getServerSession(authOptions);
    
    // Get cookies
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("next-auth.session-token")?.value;
    const debugToken = cookieStore.get("debug_token")?.value;
    
    // Log token availability
    logToFile(`Session check: sessionToken=${!!sessionToken}, debugToken=${!!debugToken}, session=${!!session}`);
    
    // Verify if session token valid via jwt decode
    let tokenValid = false;
    let tokenData = null;
    
    if (sessionToken || debugToken) {
      try {
        const token = sessionToken || debugToken;
        const decoded = decode(token as string);
        
        if (decoded && typeof decoded === 'object') {
          tokenValid = true;
          tokenData = {
            id: decoded.id,
            email: decoded.email,
            userType: decoded.userType,
            exp: decoded.exp
          };
          
          // Check if token is expired
          if (decoded.exp) {
            const expiryTime = new Date((decoded.exp as number) * 1000);
            const now = new Date();
            
            // If token expires in less than 30 minutes, we'll mark it as nearly expired
            const thirtyMinutes = 30 * 60 * 1000;
            const nearlyExpired = expiryTime.getTime() - now.getTime() < thirtyMinutes;
            
            logToFile(`Token expiry: ${expiryTime.toISOString()}, nearly expired: ${nearlyExpired}`);
            
            if (now > expiryTime) {
              tokenValid = false;
              logToFile('Token is expired');
            }
          }
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
        logToFile(`Error decoding token: ${error.message}`);
      }
    }
    
    const result = {
      valid: !!session || tokenValid,
      session: !!session,
      tokenValid,
      tokenData: tokenValid ? tokenData : null,
      timestamp: new Date().toISOString()
    };
    
    logToFile(`Session check result: ${JSON.stringify(result)}`);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Session check error:', error);
    logToFile(`Session check error: ${error.message}`);
    
    return NextResponse.json({
      valid: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 