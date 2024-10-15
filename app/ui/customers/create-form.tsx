"use client"

import { Customer } from '@/app/lib/definitions';
import Link from 'next/link';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { useState } from 'react'; // Import useState
import { createCustomer, StateCustomer } from '@/app/lib/actions';
import { useActionState } from 'react';

export default function Form({ customers }: { customers: Customer[] }) {
   
  const initialState: StateCustomer = { message: '', errors: {  name: [], email: [], image_url: [],} };
  const [state, formAction] = useActionState(createCustomer, initialState);

  // Define o estado local para armazenar os valores do formulário
  const [formValues, setFormValues] = useState({name: '', email: '', image_url: '',});

  // Função para lidar com mudanças no formulário e atualizar os valores
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value, // Atualiza o valor do campo específico
    });
  };

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Customer Name */}
        <div className="mb-4">
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Name
          </label>
          <div className="relative mt-2 rounded-md">
            <input 
              id="name" 
              name="name"
              type="text"
              step="0.01"
              placeholder="Customer name"
              value={formValues.name} // Vincula o valor ao estado
              onChange={handleInputChange} // Atualiza o estado quando o valor muda
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="amount-error"
            />
          </div>
        </div>
        <div className="mb-4">
          <fieldset>
            <legend className="mb-2 block text-sm font-medium">
              E-mail
            </legend>
              <div className="flex gap-4">
                <input 
                  id="email" 
                  name="email"
                  type="text"
                  step="0.01"
                  placeholder="Customer e-mail"
                  value={formValues.email} // Vincula o valor ao estado
                  onChange={handleInputChange} // Atualiza o estado quando o valor muda
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  aria-describedby="amount-error"
                />
              </div>
          </fieldset>
        </div>
        <div className="mb-4">
          <fieldset>
            <legend className="mb-2 block text-sm font-medium">
              Image URL
            </legend>
              <div className="flex gap-4">
                <input 
                  id="image_url" 
                  name="image_url"
                  type="text"
                  step="0.01"
                  placeholder="Image URL"
                  value={formValues.image_url} // Vincula o valor ao estado
                  onChange={handleInputChange} // Atualiza o estado quando o valor muda
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  aria-describedby="amount-error"
                />
              </div>
          </fieldset>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/customers"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Create Customer</Button>
      </div>
    </form>
  );
}
