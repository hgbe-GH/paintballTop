import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { compare } from "bcryptjs";
import { getEnv } from "./env";
import { prisma } from "./prisma";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide" }),
  password: z
    .string()
    .min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
});

const env = getEnv();

const emailProvider = EmailProvider({
  from: env.EMAIL_FROM,
  maxAge: 60 * 60, // 1 hour
  sendVerificationRequest: async ({ identifier, url }) => {
    // In development, log the magic link so testers can inspect it quickly.
    if (process.env.NODE_ENV !== "production") {
      console.info(`Magic link pour ${identifier}: ${url}`);
    }
  },
});

if (env.EMAIL_SERVER_HOST && env.EMAIL_SERVER_PORT) {
  emailProvider.server = {
    host: env.EMAIL_SERVER_HOST,
    port: env.EMAIL_SERVER_PORT,
    auth:
      env.EMAIL_SERVER_USER && env.EMAIL_SERVER_PASSWORD
        ? {
            user: env.EMAIL_SERVER_USER,
            pass: env.EMAIL_SERVER_PASSWORD,
          }
        : undefined,
  };
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "database",
  },
  providers: [
    emailProvider,
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
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.name = user.name ?? session.user.name;
      }

      return session;
    },
  },
  theme: {
    colorScheme: "auto",
    logo: "/favicon.ico",
  },
};
