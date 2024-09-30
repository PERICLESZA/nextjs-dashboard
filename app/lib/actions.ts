'use server';

import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
    id: z.number(),
    customerId: z.number(),
    amount: z.number(),
    status: z.enum(['pending', 'paid']),
    date: z.date(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
 
const prisma = new PrismaClient();

export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: Number(formData.get('customerId')),
        amount: Number(formData.get('amount')),
        status: formData.get('status'),
    });
    // const amountInCents = amount * 100;
    const date = new Date();

    await prisma.$queryRaw`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amount}, ${status}, ${date})
    `;
    revalidatePath('/dashbard/invoices')
    redirect('/dashboard/invoices')
}

export async function updateInvoice(id: number, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
      customerId: Number(formData.get('customerId')),
      amount: Number(formData.get('amount')),
      status: formData.get('status'),
    });
   
    // const amountInCents = amount * 1;
   
    await prisma.$queryRaw`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amount}, status = ${status}
      WHERE id = ${id}
    `;
   
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  }