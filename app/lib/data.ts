import { PrismaClient } from '@prisma/client';
import { formatCurrency } from './utils';

const prisma = new PrismaClient();

export async function fetchRevenue() {
  try {

    const response = await prisma.revenue.findMany();
    
    if (!response) {
      throw new Error('Failed to fetch revenue data.');
    }
    
    // console.log(response)
    return response;

  } catch (error) {
    // console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    // Consulta SQL para buscar as 5 faturas mais recentes, incluindo os dados do cliente
    // const invoices    = await prisma.$queryRaw<InvoiceWithCustomer[]>`
    const latestInvoices = await prisma.$queryRaw<InvoiceWithCustomer[]>`
      SELECT 
        i.id, 
        i.amount, 
        c.name, 
        c.email, 
        c.image_url 
      FROM invoices i
      INNER JOIN customers c ON i.customer_id = c.id
      ORDER BY i.date DESC
      LIMIT 5;
    `;

    if (latestInvoices.length === 0) {
      throw new Error('No invoices found.');
    }

    // Formata o resultado para retornar um array de faturas
    return latestInvoices.map(invoice => ({
      id: invoice.id,
      amount: Number(invoice.amount), // Converte Decimal para String se necessário
      name: invoice.name,
      email: invoice.email,
      image_url: invoice.image_url,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    const [invoiceCount, customerCount, invoiceStatus] = await Promise.all([
      prisma.invoices.count(),
      prisma.customers.count(),
      prisma.invoices.groupBy({
        by: ['status'],
        _sum: {
          amount: true,
        },
      }),
    ]);

    const totalPaidInvoices = invoiceStatus.find((s) => s.status === 'paid')?._sum.amount?.toNumber() || 0;
    const totalPendingInvoices = invoiceStatus.find((s) => s.status === 'pending')?._sum.amount?.toNumber() || 0;

    return {
      numberOfInvoices: invoiceCount,
      numberOfCustomers: customerCount,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

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

export async function fetchFilteredInvoices(query: string, currentPage: number) {
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

  //  console.log("pippoca ==>> " + mappedInvoices) 
  return mappedInvoices;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {

    // Preparação do filtro SQL
    const filterCondition = query ? `%${query}%` : '%';

    // Consulta para obter a contagem total de registros
    const countResult = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) AS count
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE 
        c.name LIKE ${filterCondition}
        OR c.email LIKE ${filterCondition}
        OR (i.amount = ${isNaN(Number(query)) ? 0 : Number(query)} AND ${!isNaN(Number(query))})
    `;
    // Pegando a contagem de registros
    const totalRecords = Number(countResult[0].count);

    // Calculando o número total de páginas
    const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);

    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: number) {
  try {
    const invoice = await prisma.invoices.findUnique({
      where: { id: Number(id) },
      include: {
        customer: true,
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return {
      ...invoice,
      amount: invoice.amount.toNumber(),
      status: invoice.status === 'pending' || invoice.status === 'paid' ? invoice.status : 'pending', // Mapear status // Convert amount from cents to dollars
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const customers = await prisma.customers.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}


type CustomerWithTotals = {
  id: number;
  name: string;
  email: string;
  total_pending: number | null;
  total_paid: number | null;
};

export async function fetchFilteredCustomers(query: string) {
  try {
    const customers = await prisma.$queryRaw<CustomerWithTotals[]>`
      SELECT c.id, c.name, c.email,
             COALESCE(SUM(CASE WHEN i.status = 'pending' THEN i.amount ELSE 0 END), 0) AS total_pending,
             COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END), 0) AS total_paid
      FROM customers c
      LEFT JOIN invoices i ON c.id = i.customer_id
      WHERE LOWER(c.name) LIKE ${`%${query.toLowerCase()}%`} 
         OR LOWER(c.email) LIKE ${`%${query.toLowerCase()}%`}
      GROUP BY c.id
      ORDER BY c.name ASC;
    `;
      // Formatando os valores de total_pending e total_paid
      const customersData = customers.map((customer) => ({
        ...customer,
        total_pending: formatCurrency(customer.total_pending || 0),
        total_paid: formatCurrency(customer.total_paid || 0),
      }));

      return customersData;
      
      } catch (err) {
      console.error('Database Error:', err);
      throw new Error('Failed to fetch customer table.');
  }
}
 