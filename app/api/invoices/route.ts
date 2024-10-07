// app/api/invoices/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ITEMS_PER_PAGE = 6;

// Definindo o tipo de retorno da função
type InvoiceWithCustomer = {
  id: number;
  amount: number;
  status: string;
  date: Date;
  name: string;
  email: string;
  image_url: string;
};

export async function GET(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Preparação do filtro SQL
  const filterCondition = query
    ? `%${query}%`
    : '%';

  try {
    // Consulta SQL personalizada
    const invoices = await prisma.$queryRaw<InvoiceWithCustomer[]>`
      SELECT 
        i.id, 
        i.amount, 
        i.status, 
        i.date,
        c.name AS name, 
        c.image_url AS image_url,   
        c.email As email
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE 
        c.name LIKE ${filterCondition}
        OR c.email LIKE ${filterCondition}
        OR (i.amount = ${isNaN(Number(query)) ? 0 : Number(query)} AND ${!isNaN(Number(query))})
      ORDER BY i.date DESC
      LIMIT ${ITEMS_PER_PAGE}
      OFFSET ${offset};
    `;
    //  console.log(invoices)
   
    // Mapeamento de status para garantir que seja "pending" ou "paid"
   const mappedInvoices = invoices.map(invoice => ({
    ...invoice,
    status: invoice.status === 'pending' || invoice.status === 'paid' ? invoice.status : 'pending', // Ajuste conforme necessário
  }));

  return mappedInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}
