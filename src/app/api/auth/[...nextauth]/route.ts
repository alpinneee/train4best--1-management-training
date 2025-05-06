import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string || 'participant'
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || 'participant'
      }
      return token
    }
  }
})

export { handler as GET, handler as POST } 