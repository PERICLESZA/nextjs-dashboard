'use client';

import { Customer } from '@/app/lib/definitions';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { updateCustomer, StateCustomer } from '@/app/lib/actions';
import { useActionState } from 'react';
import { useState } from 'react';

export default function EditCustomerForm({ customer }: { customer: Customer }) {
  if (!customer) {
    return <div>No customer data available</div>;
  }

  const idString = String(customer.id);
  const initialState: StateCustomer = { message: '', errors: {} };
  const updateCustomerWithId = updateCustomer.bind(null, idString);
  const [state, formAction] = useActionState(updateCustomerWithId, initialState);

  // Estado para controlar o URL da imagem e o arquivo
  const [imageUrl, setImageUrl] = useState(customer.image_url || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Função para capturar a imagem
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const newImageUrl = "/customers/" + file.name;
      setImageUrl(newImageUrl);  // Atualizando o estado da URL da imagem
    }
  };

  return (
    <form action={formAction} encType="multipart/form-data">
      <input type="hidden" name="id" value={customer.id} />
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Nome do Cliente */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Choose Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={customer.name}
            placeholder="Enter name"
            className="peer block w-full rounded-md border border-gray-200 py-2 text-sm placeholder:text-gray-500"
          />
        </div>

        {/* E-mail do Cliente */}
        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Choose E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={customer.email}
            placeholder="Enter email"
            className="peer block w-full rounded-md border border-gray-200 py-2 text-sm placeholder:text-gray-500"
          />
        </div>

        {/* URL da Imagem */}
        <div className="mb-4">
          <label htmlFor="image_url" className="mb-2 block text-sm font-medium">
            Image URL
          </label>
          <input
            id="image_url"
            name="image_url"
            type="text"
            value={imageUrl}  // Exibe a URL atualizada
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Enter image URL"
            className="peer block w-full rounded-md border border-gray-200 py-2 text-sm placeholder:text-gray-500"
          />
        </div>

        {/* Campo para Selecionar Imagem */}
        <div className="mb-4">
          <label htmlFor="image" className="mb-2 block text-sm font-medium">
            Choose Image
          </label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full rounded-md border border-gray-200 py-2 text-sm"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/customers"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Edit Customer</Button>
      </div>
    </form>
  );
}
