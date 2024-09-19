import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function getCustomers() {
    try {
        // Busca todos os registros da tabela "customers"
        const customers = await prisma.customers.findMany();
        return customers;
    } catch (error) {
        console.error('Error fetching customers:', error);
        throw error;
    } finally {
        await prisma.$disconnect(); // Desconectar do Prisma após a consulta
    }
}
