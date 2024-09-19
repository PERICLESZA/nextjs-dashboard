import { NextResponse } from 'next/server';
// import  seedCustomers from './seedCustomers';
// import seedUsers from './seedUsers'; // Importe a função seedUsers do arquivo onde ela está
import seedInvoices from './seedInvoices'; // Importe a função seedUsers do arquivo onde ela está

export async function GET() {
  try {
    // Execute o seeding dos usuários
    // const users = await seedUsers();
    const users = await seedInvoices();
    // const customers = await seedCustomers();
    const invoices = await seedInvoices();invoices
    // Retorne uma resposta de sucesso com os usuários inseridos
    return NextResponse.json({ message: 'Seeded successfully', invoices });
  } catch (error) {
    console.error(error);
    // Retorne uma resposta de erro em caso de falha
    return NextResponse.json({ error: 'Seeding failed', details: error }, { status: 500 });
  }
}
