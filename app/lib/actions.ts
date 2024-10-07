'use server';

import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const FormSchema = z.object({
    id: z.number(),
    customerId: z.number().min(1,{ message: 'Please select a customer.'}),
    amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'],{ invalid_type_error: 'Please select an invoice status.',}),
    date: z.date(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
 
const prisma = new PrismaClient();

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};
 
// export async function createInvoice(prevState: State, formData: FormData) {
//   // ...
// }

export async function createInvoice(prevState: State, formData: FormData) {
  
  const customer_Id = formData.get('customerId');

  const validatedFields = CreateInvoice.safeParse({
      customerId: customer_Id ? Number(formData.get('customerId')) : null,
      amount: Number(formData.get('amount')),
      status: formData.get('status'),
  });

    // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    // console.log(prevState)
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // const amountInCents = amount * 100;
  const {customerId, amount, status } = validatedFields.data;
  const date = new Date();

  try {
    await prisma.$queryRaw`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amount}, ${status}, ${date})
    `;
  } catch (error) {
    return {message:'Database Error: Failed to Create Invoice'};
  }

  revalidatePath('/dashbard/invoices')
  redirect('/dashboard/invoices')
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: Number(formData.get('customerId')),
    amount: Number(formData.get('amount')),
    status: formData.get('status'),
  });
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }
 
  const { customerId, amount, status } = validatedFields.data;
  // const amountInCents = amount * 100;
 
    // const amountInCents = amount * 1;
  try {
    await prisma.$queryRaw`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amount}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return {message: 'Database Error: Failed to Update Invoice'}
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  //  throw new Error('Failed to Delete Invoice!');

  try{
    await prisma.$queryRaw`
      DELETE FROM invoices WHERE id = ${id}`;
      revalidatePath('/dashboard/invoices');
      return{message: 'Deleted Invoice'};
  } catch (error) {
    return {message: 'Database Error: Failes to Update Invoice'}
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}