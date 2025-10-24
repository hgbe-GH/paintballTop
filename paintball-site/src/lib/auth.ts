import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import type { Role } from "@/generated/prisma/client";
import { getEnv } from "./env";
import { prisma } from "./prisma";

const credentialsSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide" }),
  password: z
    .string()
    .min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
});

const env = getEnv();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/logout",
  },
  providers: [
    CredentialsProvider({
      name: "Connexion",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          throw new Error(parsed.error.issues.map((issue) => issue.message).join(", "));
        }

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            passwordHash: true,
            role: true,
          },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Identifiants incorrects");
        }

        const valid = await compare(password, user.passwordHash);

        if (!valid) {
          throw new Error("Identifiants incorrects");
        }

        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          role: user.role,
        } satisfies {
          id: string;
          email?: string;
          name?: string;
          image?: string;
          role: Role;
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        if (token.role) {
          session.user.role = token.role as Role;
        }
        if (token.name && !session.user.name) {
          session.user.name = token.name;
        }
        if (token.email && !session.user.email) {
          session.user.email = token.email;
        }
      }

      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: Role }).role ?? token.role;
      } else if (!token.role && token.sub) {
        const existingUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        });

        if (existingUser) {
          token.role = existingUser.role;
        }
      }

      return token;
    },
  },
  theme: {
    colorScheme: "auto",
    logo: "/favicon.ico",
  },
};
