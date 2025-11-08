import type { ITransaction } from "@/components/dashboard/transactions-list";
import { TransactionsList } from "@/components/dashboard/transactions-list";

const mockTransactions: ITransaction[] = [
  {
    id: "txn-1",
    customerName: "Liam Johnson",
    customerEmail: "liam@example.com",
    type: "Sale",
    status: "approved",
    date: "2025-11-01",
    amount: "$250.00",
  },
  {
    id: "txn-2",
    customerName: "Olivia Smith",
    customerEmail: "olivia@example.com",
    type: "Refund",
    status: "declined",
    date: "2025-11-02",
    amount: "$150.00",
  },
  {
    id: "txn-3",
    customerName: "Noah Williams",
    customerEmail: "noah@example.com",
    type: "Subscription",
    status: "approved",
    date: "2025-11-03",
    amount: "$350.00",
  },
  {
    id: "txn-4",
    customerName: "Emma Brown",
    customerEmail: "emma@example.com",
    type: "Sale",
    status: "approved",
    date: "2025-11-04",
    amount: "$450.00",
  },
];

export async function TransactionsSection() {
  return <TransactionsList transactions={mockTransactions} />;
}
