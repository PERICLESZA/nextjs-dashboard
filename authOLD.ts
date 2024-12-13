
import { PrismaClient, login as loginType } from '@prisma/client';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Função para buscar o usuário na tabela login
async function getUser(email: string): Promise<loginType | undefined> {
  try {
    // Define explicitamente o tipo de rows
    const rows = await prisma.$queryRaw<loginType[]>`SELECT * FROM login WHERE email = ${email}`;
    
    // Verifica se há algum resultado
    if (rows.length > 0) {
      return rows[0]; // Retorna o primeiro usuário encontrado
    }
    return undefined;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // Validação das credenciais usando Zod
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          // console.log(user);
          // Verifica se o usuário existe e se a senha está correta
          if (user && user.senha) { // Verifica se a senha não é null
            const isPasswordValid = await bcrypt.compare(password, user.senha);
            if (isPasswordValid) {
              return user;
            }
          }
        }
        return null; // Retorna null em caso de falha na autenticação
      },
    }),
  ],
});