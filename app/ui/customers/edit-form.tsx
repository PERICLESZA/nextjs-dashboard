'use client'

console.log('11111')

import { Customer} from '@/app/lib/definitions';
import {CheckIcon,ClockIcon,  UserCircleIcon} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { updateCustomer, StateCustomer } from '@/app/lib/actions';
import { useActionState } from 'react';

// export default function EditCustomerForm(customer: Object) {
export default function EditCustomerForm({customer,}: {customer: Customer;}) {

  console.log('entrei no EditCustomerForm')

  if (!customer) {
    console.log('Customer is undefined or null');
    return <div>No customer data available</div>;
  }

  const idString = String(customer.id)
  console.log(idString)
  const initialState: StateCustomer = { message: '', errors: {} };
  const updateCustomerWithId = updateCustomer.bind(null, idString);
  const [state, formAction] = useActionState(updateCustomerWithId, initialState);

  console.log('State:', formAction);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={customer.id} />
       <div className="rounded-md bg-gray-50 p-4 md:p-6">
         {/* Customer Name */}
         
         <div className="mb-4">
         
            <div className="relative">
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Choose Name
              </label>
              <div className="relative mt-2 rounded-md">
                <div className="relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    defaultValue={customer.name}
                    placeholder="Enter name"
                    className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>
         {/* Invoice Amount */}
         <div className="mb-4">
           <label htmlFor="amount" className="mb-2 block text-sm font-medium">
             Choose E-mail
           </label>
           <div className="relative mt-2 rounded-md">
             <div className="relative">
               <input
                 id="email"
                 name="email"
                 type="email"
                 defaultValue={customer.email}
                 placeholder="Enter email"
                 className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
               />
             </div>
           </div>
         </div>
       </div>
       <div className="mt-6 flex justify-end gap-4">
          <Link
            href="/dashboard/customers"
            className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
           Cancel
         </Link>
         <Button type="submit">Edit Customer</Button>
       </div>
     </form>
  );
}
