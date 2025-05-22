import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";

// Define our custom types
interface CustomUser {
  id: string;
  email: string;
  name: string;
  userType: string;
}

// Type declarations
declare module "next-auth" {
  interface User {
    id: string;
    userType: string;
  }
  
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      userType: string;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    userType: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { userType: true }
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // Return user with the properly typed properties
        return {
          id: user.id,
          email: user.email,
          name: user.username,
          userType: user.userType.usertype
        };
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      try {
        if (user) {
          // Store values on the token
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.userType = user.userType;
          
          console.log("JWT callback - token diperbaharui untuk user:", {
            id: token.id,
            email: token.email,
            userType: token.userType
          });
        } else {
          console.log("JWT callback - user tidak ada, token saat ini:", {
            id: token.id,
            email: token.email,
            userType: token.userType
          });
        }
        return token;
      } catch (error) {
        console.error("Error dalam JWT callback:", error);
        return token;
      }
    },
    session: async ({ session, token }) => {
      try {
        if (token && session.user) {
          // Ensure user ID is available in the session
          session.user.id = token.id;
          session.user.email = token.email;
          session.user.name = token.name;
          session.user.userType = token.userType;
          
          console.log("Session callback - session diperbaharui dengan token:", {
            id: session.user.id,
            email: session.user.email,
            userType: session.user.userType
          });
        } else {
          console.log("Session callback - token atau session.user tidak ada:", { 
            tokenExists: !!token, 
            sessionUserExists: !!session.user 
          });
        }
        return session;
      } catch (error) {
        console.error("Error dalam Session callback:", error);
        return session;
      }
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 hari
  },
  debug: process.env.NODE_ENV === 'development',
}; 