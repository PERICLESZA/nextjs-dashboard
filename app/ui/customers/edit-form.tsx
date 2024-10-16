'use client';

import { Customer } from '@/app/lib/definitions';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { updateCustomer, StateCustomer } from '@/app/lib/actions';
import { useActionState } from 'react';
import { useState, useEffect } from 'react';

export default function EditCustomerForm({ customer }: { customer: Customer }) {
  if (!customer) {
    return <div>No customer data available</div>;
  }

  const idString = String(customer.id);
  const initialState: StateCustomer = { message: '', errors: {} };
  const updateCustomerWithId = updateCustomer.bind(null, idString);
  const [state, formAction] = useActionState(updateCustomerWithId, initialState);

  const [imageUrl, setImageUrl] = useState(customer.image_url || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (selectedFile) {
      const fileUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(fileUrl);
    }
  }, [selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const newImageUrl = "/customers/" + file.name;
      setImageUrl(newImageUrl);
    }
  };

  // Função para abrir o seletor de arquivos ao clicar no botão personalizado
  const handleFileButtonClick = () => {
    const fileInput = document.getElementById('image') as HTMLInputElement;
    fileInput.click();
  };

  return (
    <form action={formAction} encType="multipart/form-data">
      <input type="hidden" name="id" value={customer.id} />
      <input type="hidden" name="image_url" value={imageUrl} />
      
      {/* Contêiner flex para alinhar campos e imagem */}
      <div className="flex flex-col md:flex-row rounded-md bg-gray-50 p-4 md:p-6">
        {/* Coluna dos campos (name e email) */}
        <div className="flex-1 md:mr-4">
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
        </div>

        {/* Coluna da imagem (alinhada à direita) */}
        <div className="flex-none">
          <div className="mb-4">
            <div className="mb-2">
              {previewUrl ? (
                <img src={previewUrl} alt="Selected Image" className="w-32 h-32 object-cover" />
              ) : (
                <img src={imageUrl} alt="Customer Image" className="w-32 h-32 object-cover" />
              )}
            </div>
          </div>

          <div className="mb-4">
            
            {/* Input de arquivo oculto */}
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"  // Ocultar o campo de arquivo padrão
            />

            {/* Botão personalizado para escolher o arquivo */}
            <button
              type="button"
              onClick={handleFileButtonClick}
              className="block w-full rounded-md border border-gray-200 py-2 text-sm bg-gray-100 hover:bg-gray-200"
            >
              Choose File
            </button>
          </div>
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
