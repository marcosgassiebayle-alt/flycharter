import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const operator = await prisma.operator.findUnique({
          where: { email: credentials.email },
        });

        if (!operator) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          operator.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: operator.id,
          email: operator.email,
          name: operator.name,
          verified: operator.verified,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.verified = (user as unknown as { verified: boolean }).verified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
        (session.user as { verified: boolean }).verified =
          token.verified as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/ingresar",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
