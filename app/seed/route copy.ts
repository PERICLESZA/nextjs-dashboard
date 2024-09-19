import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

const prisma = new PrismaClient();

async function seedUsers() {
  // Insere os usuários com senhas criptografadas
  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return prisma.users.upsert({
        where: { id: Number(user.id) },
        update: {},
        create: {
          id: Number(user.id),
          name: user.name,
          email: user.email,
          password: hashedPassword,
        },
      });
    })
  );
  return insertedUsers;
}

// async function seedInvoices() {
//   // Insere as faturas (invoices)
//   const insertedInvoices = await Promise.all(
//     invoices.map((invoice) =>
//       prisma.invoice.upsert({
//         where: { id: invoice.id },
//         update: {},
//         create: {
//           id: invoice.id,
//           customerId: invoice.customer_id,
//           amount: invoice.amount,
//           status: invoice.status,
//           date: new Date(invoice.date),
//         },
//       })
//     )
//   );
//   return insertedInvoices;
// }

// async function seedCustomers() {
//   // Insere os clientes
//   const insertedCustomers = await Promise.all(
//     customers.map((customer) =>
//       prisma.customer.upsert({
//         where: { id: customer.id },
//         update: {},
//         create: {
//           id: customer.id,
//           name: customer.name,
//           email: customer.email,
//           imageUrl: customer.image_url,
//         },
//       })
//     )
//   );
//   return insertedCustomers;
// }

// async function seedRevenue() {
//   // Insere as receitas (revenue)
//   const insertedRevenue = await Promise.all(
//     revenue.map((rev) =>
//       prisma.revenue.upsert({
//         where: { month: rev.month },
//         update: {},
//         create: {
//           month: rev.month,
//           revenue: rev.revenue,
//         },
//       })
//     )
//   );
//   return insertedRevenue;
// }

// export async function GET() {
//   try {
//     // Inicia uma transação
//     await prisma.$transaction(async () => {
//       await seedUsers();
//       await seedCustomers();
//       await seedInvoices();
//       await seedRevenue();
//     });

//     return Response.json({ message: 'Database seeded successfully' });
//   } catch (error) {
//     console.error('Seeding error:', error);
//     return Response.json({ error: error.message }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//   }
// }




//  import bcrypt from 'bcrypt';
// // import { db } from '@vercel/postgres';
// // import { invoices, customers, revenue, users } from '../lib/placeholder-data';

// // const client = await db.connect();

// // async function seedUsers() {
// //   await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
// //   await client.sql`
// //     CREATE TABLE IF NOT EXISTS users (
// //       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
// //       name VARCHAR(255) NOT NULL,
// //       email TEXT NOT NULL UNIQUE,
// //       password TEXT NOT NULL
// //     );
// //   `;

// //   const insertedUsers = await Promise.all(
// //     users.map(async (user) => {
// //       const hashedPassword = await bcrypt.hash(user.password, 10);
// //       return client.sql`
// //         INSERT INTO users (id, name, email, password)
// //         VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
// //         ON CONFLICT (id) DO NOTHING;
// //       `;
// //     }),
// //   );

// //   return insertedUsers;
// // }

// // async function seedInvoices() {
// //   await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

// //   await client.sql`
// //     CREATE TABLE IF NOT EXISTS invoices (
// //       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
// //       customer_id UUID NOT NULL,
// //       amount INT NOT NULL,
// //       status VARCHAR(255) NOT NULL,
// //       date DATE NOT NULL
// //     );
// //   `;

// //   const insertedInvoices = await Promise.all(
// //     invoices.map(
// //       (invoice) => client.sql`
// //         INSERT INTO invoices (customer_id, amount, status, date)
// //         VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
// //         ON CONFLICT (id) DO NOTHING;
// //       `,
// //     ),
// //   );

// //   return insertedInvoices;
// // }

// // async function seedCustomers() {
// //   await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

// //   await client.sql`
// //     CREATE TABLE IF NOT EXISTS customers (
// //       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
// //       name VARCHAR(255) NOT NULL,
// //       email VARCHAR(255) NOT NULL,
// //       image_url VARCHAR(255) NOT NULL
// //     );
// //   `;

// //   const insertedCustomers = await Promise.all(
// //     customers.map(
// //       (customer) => client.sql`
// //         INSERT INTO customers (id, name, email, image_url)
// //         VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
// //         ON CONFLICT (id) DO NOTHING;
// //       `,
// //     ),
// //   );

// //   return insertedCustomers;
// // }

// // async function seedRevenue() {
// //   await client.sql`
// //     CREATE TABLE IF NOT EXISTS revenue (
// //       month VARCHAR(4) NOT NULL UNIQUE,
// //       revenue INT NOT NULL
// //     );
// //   `;

// //   const insertedRevenue = await Promise.all(
// //     revenue.map(
// //       (rev) => client.sql`
// //         INSERT INTO revenue (month, revenue)
// //         VALUES (${rev.month}, ${rev.revenue})
// //         ON CONFLICT (month) DO NOTHING;
// //       `,
// //     ),
// //   );

// //   return insertedRevenue;
// // }

// export async function GET() {
//   return Response.json({ message:'Uncomment this file and remove this line. You can delete this file when you are finished.',
//   });
//   // try {
//   //   await client.sql`BEGIN`;
//   //   await seedUsers();
//   //   await seedCustomers();
//   //   await seedInvoices();
//   //   await seedRevenue();
//   //   await client.sql`COMMIT`;

//   //   return Response.json({ message: 'Database seeded successfully' });
//   // } catch (error) {
//   //   await client.sql`ROLLBACK`;
//   //   return Response.json({ error }, { status: 500 });
//   // }
// }
