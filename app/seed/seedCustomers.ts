import { PrismaClient } from '@prisma/client';
import { customers } from '../lib/placeholder-data'; // Dados de usuários fictícios

const prisma = new PrismaClient();

export default async function seedCustomers() {
    try {
        const insertedCustomers = await Promise.all(
            customers.map(async (customer) => {
                console.log(`Seeding customer: ${customer.name}`);
                return prisma.customers.upsert({
                    where: { email: customer.email }, // Agora o email é único
                    update: {}, // Sem necessidade de atualização de dados
                    create: {
                        name: customer.name,
                        email: customer.email,
                        image_url: customer.image_url, // Certifique-se de que este campo existe no modelo
                    },
                });
            })
        );
        return insertedCustomers;
    } catch (error) {
        console.error('Error seeding customers:', error);
        throw error;
    }
}
