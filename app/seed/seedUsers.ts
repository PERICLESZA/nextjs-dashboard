import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { users } from '../lib/placeholder-data'; // Dados de usuários fictícios

const prisma = new PrismaClient();

export default async function seedUsers() {
    try {
        const insertedUsers = await Promise.all(
            users.map(async (user) => {
                console.log(`Seeding user: ${user.name}`);
                const hashedPassword = await bcrypt.hash(user.password, 10);
                return prisma.users.upsert({
                    where: { email: user.email }, // Use um campo único como identificador para a operação upsert
                    update: {},
                    create: {
                        name: user.name,
                        email: user.email,
                        password: hashedPassword,
                    },
                });
            })
        );
        return insertedUsers;
    } catch (error) {
        console.error('Error seeding users:', error);
        throw error; // Isso irá gerar a resposta com detalhes do erro
    }
}
