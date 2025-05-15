import NextAuth from "next-auth/next"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Kata Sandi", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Mohon masukkan email dan kata sandi')
          }

          // Find user with userType
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { userType: true }
          })

          if (!user) {
            throw new Error('Pengguna tidak ditemukan')
          }

          // Verify password
          const isValid = await bcrypt.compare(credentials.password, user.password)
          if (!isValid) {
            throw new Error('Kata sandi salah')
          }

          // Return simplified user object
          return {
            id: user.id,
            email: user.email,
            name: user.username,
            userType: user.userType.usertype
          }
        } catch (error) {
          console.error('Kesalahan otorisasi:', error)
          throw error
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          token.id = user.id
          token.email = user.email
          token.name = user.name
          token.userType = user.userType
        }
        return token
      } catch (error) {
        console.error('Error in JWT callback:', error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (token && session.user) {
          session.user.id = token.id as string
          session.user.name = token.name as string
          session.user.email = token.email as string
          session.user.userType = token.userType as string
        }
        return session
      } catch (error) {
        console.error('Error in session callback:', error)
        return session
      }
    }
  },
  debug: false,
  secret: process.env.NEXTAUTH_SECRET
})

export { handler as GET, handler as POST }