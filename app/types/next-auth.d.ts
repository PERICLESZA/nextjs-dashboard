import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name: string | null;
    email: string | null;
    login: string | null;
    perfil?: string | null; // Campo personalizado
    active?: string | null;  // Campo personalizado
  }

  interface Session {
    user: User;
  }

  interface JWT {
    id: string;
    name: string | null;
    email: string | null;
    login: string | null;
    perfil?: string | null; // Campo personalizado
    active?: string | null; // Campo personalizado
  }
}
