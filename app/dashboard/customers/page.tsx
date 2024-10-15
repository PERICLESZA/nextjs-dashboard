import Pagination from '@/app/ui/invoices/pagination';
import { fetchCustomerPages, fetchFilteredCustomer } from '@/app/lib/data';
import Search from '@/app/ui/search';
import TableCustomer from '@/app/ui/customers/tableCustomer';
import { CreateCustomer } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';
import { CustomersTableSkeleton } from '@/app/ui/skeletons';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  // Aguardar a resolução de searchParams
  const { query = '', page = '1' } = await searchParams || {};
  const currentPage = Number(page);

  // Busque os dados das faturas aqui
  const totalPages = await fetchCustomerPages(query);
  const customers = await fetchFilteredCustomer(query, currentPage);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Customers</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search customer..." />
        <CreateCustomer />
      </div>
      <Suspense fallback={<CustomersTableSkeleton />}>
        <TableCustomer query={query} currentPage={currentPage} customers={customers} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
