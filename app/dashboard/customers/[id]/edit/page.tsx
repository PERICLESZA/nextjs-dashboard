import Form from '@/app/ui/customers/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomerById } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { id: number } }) { // Certifique-se de que o tipo de `id` é string
  const { id } = await Promise.resolve(params); // params.id é acessado diretamente após ser resolvido
  // const customer = await fetchCustomerById(id); // Buscando o cliente pelo ID
 
  const [customer] = await Promise.all([fetchCustomerById(id)]);

  // Verifique se o cliente foi encontrado
  if (!customer) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Customers', href: '/dashboard/customers' },
          {
            label: 'Edit Customer',
            href: `/dashboard/customers/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form customer={customer} />
      {/* <Form customer={{
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        image_url: 'image.jpg'
       }} /> */}
    </main>
  );
}
