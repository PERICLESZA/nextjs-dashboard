import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByCredentials } from "@/app/lib/user";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "example@example.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Your password",
        },
      },
      authorize: async (credentials: {
        email?: unknown;
        password?: unknown;
      }) => {
        const email =
          typeof credentials?.email === "string" ? credentials.email : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        const user = await findUserByCredentials(email, password);

        if (user) {
          return {
            id: user.idlogin?.toString() || "",
            name: user.nome || null,
            email: user.email || "",
            login: user.login || null,
            perfil: user.perfil || null,
            active: user.active || null,
            emailVerified: null, // Explicitly set as null to match the expected type
          };
        }

        return null; // Return null if user not found
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          name: token.name || null,
          email: token.email || "",
          login: token.login as string | null,
          perfil: token.perfil as string | null,
          active: token.active as string | null,
          emailVerified: null, // Set explicitly to null
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || "";
        token.name = user.name || null;
        token.email = user.email || "";
        token.login = user.login || null;
        token.perfil = user.perfil || null;
        token.active = user.active || null;
        token.emailVerified = null; // Ensure null is assigned explicitly
      }
      return token;
    },
  },
});
