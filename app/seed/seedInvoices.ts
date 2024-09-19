import { PrismaClient } from '@prisma/client';
import { invoices } from '../lib/placeholder-data'; // Dados de usuários fictícios

const prisma = new PrismaClient();

export default async function seedInvoices() {
    try {
        const insertedInvoices = await Promise.all(
            invoices.map(async (invoice) => {
                console.log(`Seeding invoice: ${invoice.customer_id}`);
                return prisma.invoices.upsert({
                    where: { id: Number(invoice.customer_id) },  // Converte customer_id para número
                    update: {},
                    create: {
                        id: Number(invoice.customer_id),  // Converte customer_id para número
                        customer_id: Number(invoice.customer_id),  // Converte customer_id para número
                        amount: invoice.amount,
                        status: invoice.status,
                        date: new Date(invoice.date),
                    },
                });
            })
        );
        return insertedInvoices;
    } catch (error) {
        console.error('Error seeding invoices:', error);
        throw error; // Isso irá gerar a resposta com detalhes do erro
    }
}

//     //async function seedInvoices() {
//     //   // Insere as faturas (invoices)
//     //   const insertedInvoices = await Promise.all(
//     //     invoices.map((invoice) =>
//     //       prisma.invoice.upsert({
//     //         where: { id: invoice.id },
//     //         update: {},
//     //         create: {
//     //           id: invoice.id,
//     //           customerId: invoice.customer_id,
//     //           amount: invoice.amount,
//     //           status: invoice.status,
//     //           date: new Date(invoice.date),
//     //         },
//     //       })
//     //     )
//     //   );
//     //   return insertedInvoices;
//     // }