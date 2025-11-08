import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface ITransaction {
  id: string;
  customerName: string;
  customerEmail: string;
  type: string;
  status: "approved" | "declined";
  date: string;
  amount: string;
}

export function TransactionsList({
  transactions,
}: {
  transactions: ITransaction[];
}) {
  return (
    <Card className="xl:col-span-2">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Transactions</CardTitle>
          <CardDescription className="text-balance">
            Recent transactions from your store.
          </CardDescription>
        </div>
        <Button size="sm" className="ml-auto shrink-0 gap-1 px-4">
          <Link href="#" className="flex items-center gap-2">
            <span>View All</span>
            <ArrowUpRight className="hidden size-4 sm:block" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden xl:table-column">Type</TableHead>
              <TableHead className="hidden xl:table-column">Status</TableHead>
              <TableHead className="hidden xl:table-column">Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="font-medium">{transaction.customerName}</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    {transaction.customerEmail}
                  </div>
                </TableCell>
                <TableCell className="hidden xl:table-column">
                  {transaction.type}
                </TableCell>
                <TableCell className="hidden xl:table-column">
                  <Badge
                    className="text-xs"
                    variant={
                      transaction.status === "approved"
                        ? "outline"
                        : "secondary"
                    }
                  >
                    {transaction.status === "approved"
                      ? "Approved"
                      : "Declined"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell lg:hidden xl:table-column">
                  {transaction.date}
                </TableCell>
                <TableCell className="text-right">
                  {transaction.amount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
