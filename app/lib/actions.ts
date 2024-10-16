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

const FormSchemaCustomer = z.object({
  id: z.number().min(1,{ message: 'Please select a customer.'}),
  name: z.string().min(1,{ message: 'Please enter with customer name.' }),
  email: z.string().min(1,{ message: 'Please enter with customer e-mail.'}),
  image_url: z.string().min(1,{ message: 'Please enter with customer picture path.'}),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const CreateCustomer = FormSchemaCustomer.omit({ id: true });
const UpdateCustomer = FormSchemaCustomer.omit({ id: true });
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

export type StateCustomer = {
  // id: number;

  errors?: {
    name?: string[];
    email?: string[];
    image_url?: string[];
  };
  message?: string;
};


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

export async function updateCustomer(
  id: string,
  prevState: StateCustomer,
  formData: FormData,
) {
  const validatedFields = UpdateCustomer.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    email: formData.get('email'),
    image_url: formData.get('image_url'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors || {},
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }
 
  const { name, email, image_url } = validatedFields.data;
  
  console.log( name, email, image_url )
  
  try {

      await prisma.$queryRaw`
        UPDATE customers
        SET name = ${name}, email = ${email}, image_url = ${image_url}
        WHERE id = ${id}`;

} catch (error) {
    return {message: 'Database Error: Failed to Update Customer'}
  }
  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
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

export async function createCustomer(prevState: StateCustomer, formData: FormData) {
  const validatedFields = CreateCustomer.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    image_url: formData.get('image_url'),
  });

  // Se a validação do formulário falhar, retorna erros cedo.
  if (!validatedFields.success) {
    return {
      errors: {
        name: validatedFields.error.flatten().fieldErrors.name || [],
        email: validatedFields.error.flatten().fieldErrors.email || [],
        image_url: validatedFields.error.flatten().fieldErrors.image_url || [],
      },
      message: 'Missing Fields. Failed to Create Customer.',
    };
  }

  const { name, email, image_url } = validatedFields.data;

  try {
    await prisma.$queryRaw`
      INSERT INTO customers (name, email, image_url)
      VALUES (${name}, ${email}, ${image_url})
    `;
    return {
      errors: { name: [], email: [], image_url: [] }, // Sem erro após sucesso
      message: 'Customer created successfully!', // Mensagem de sucesso
    };
  } catch (error) {
    return {
      errors: { name: [], email: [], image_url: [] }, // Sem erros específicos, apenas falha geral
      message: 'Database Error: Failed to Create Customer', // Mensagem de erro genérica
    };
  }

  revalidatePath('/dashbard/customers')
  redirect('/dashboard/customers')
}
