import { PrismaClient } from '@prisma/client';
import { formatCurrency } from './utils';

const prisma = new PrismaClient();

export async function fetchRevenue() {
  try {

    // console.log('Fetching revenue data...');
    // await new Promise((resolve) => setTimeout(resolve, 5000));

    const data = await prisma.revenue.findMany();

    // console.log('Fetched revenue data:', data); // Verifique a estrutura dos dados aqui
    // console.log('Data hetch completed after 5 seconds.')  

    return data;
  } catch (error) {
    // console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    // Busca as 5 faturas mais recentes, incluindo os dados do cliente
    const latestInvoices = await prisma.invoices.findMany({
      orderBy: { date: 'desc', // Ordena pela data mais recente
      },
      take: 5, // Limita a busca às 5 faturas mais recentes
      include: { customer: true, // Inclui os dados do cliente relacionado
      },
    });

    if (latestInvoices.length === 0) {
      throw new Error('No invoices found.');
    }

    // Formata o resultado para retornar um array de faturas
    return latestInvoices.map(invoice => ({
      id: invoice.id.toString(),
      amount: invoice.amount.toString(), // Converte Decimal para String
      name: invoice.customer.name,
      email: invoice.customer.email,
      image_url: invoice.customer.image_url,
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

    const totalPaidInvoices = formatCurrency(
      invoiceStatus.find((s) => s.status === 'paid')?._sum.amount?.toNumber() || 0
    );
    const totalPendingInvoices = formatCurrency(
      invoiceStatus.find((s) => s.status === 'pending')?._sum.amount?.toNumber() || 0
    );

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
        i.id, i.amount, i.status, i.date,
        c.name AS name, c.image_url AS image_url,   c.email As email
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

return invoices;

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


export async function fetchInvoiceById(id: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
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
      amount: invoice.amount / 100, // Convert amount from cents to dollars
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const customers = await prisma.customer.findMany({
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

export async function fetchFilteredCustomers(query: string) {
  try {
    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        invoices: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const customersData = customers.map((customer) => {
      const totalPending = customer.invoices
        .filter((invoice) => invoice.status === 'pending')
        .reduce((sum, invoice) => sum + invoice.amount, 0);
      const totalPaid = customer.invoices
        .filter((invoice) => invoice.status === 'paid')
        .reduce((sum, invoice) => sum + invoice.amount, 0);

      return {
        ...customer,
        total_pending: formatCurrency(totalPending),
        total_paid: formatCurrency(totalPaid),
      };
    });

    return customersData;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}
