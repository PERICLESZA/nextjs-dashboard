import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { formatCurrency } from '@/app/lib/utils';

// Definição do tipo para os dados que CardWrapper receberá
interface CardWrapperProps {
  totalPaidInvoices: number;
  totalPendingInvoices: number;
  numberOfInvoices: number;
  numberOfCustomers: number;
}

// Mapeamento dos ícones
const iconMap = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
};

// Componente Card
export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'invoices' | 'customers' | 'pending' | 'collected';
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}

// Componente CardWrapper
export function CardWrapper({
  totalPaidInvoices,
  totalPendingInvoices,
  numberOfInvoices,
  numberOfCustomers,
}: CardWrapperProps) {
  return (
    <>
      <Card title="Collected" value={formatCurrency(totalPaidInvoices)} type="collected" />
      <Card title="Pending" value={formatCurrency(totalPendingInvoices)} type="pending" />
      <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
      <Card title="Total Customers" value={numberOfCustomers} type="customers" />
    </>
  );
}
