import { IPlansRow } from "@/types";
import { CircleCheck, Info } from "lucide-react";

import { comparePlans, plansColumns } from "@/config/subscriptions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HeaderSection } from "@/components/shared/header-section";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

function renderCell(value: string | boolean | null) {
  if (value === null) return "—";
  if (typeof value === "boolean") {
    return value ? <CircleCheck className="mx-auto size-[22px]" /> : "—";
  }
  return value;
}

export function ComparePlans() {
  const headerColumns = plansColumns.map(function renderHeader(column) {
    return (
      <th
        key={column}
        className="sticky z-10 w-40 bg-accent p-5 font-heading text-xl capitalize tracking-wide text-accent-foreground md:w-auto lg:top-14 lg:text-2xl"
      >
        {column}
      </th>
    );
  });

  const tableRows = comparePlans.map(function renderRow(
    row: IPlansRow,
    index,
  ) {
    const rowCells = plansColumns.map(function renderDataCell(column) {
      return (
        <td
          key={column}
          className="p-4 text-center text-[15px] text-muted-foreground lg:text-base"
        >
          {renderCell(row[column])}
        </td>
      );
    });

    return (
      <tr key={index} className="divide-x divide-border border">
        <td
          data-tip={row.tooltip ?? ""}
          className="sticky left-0 bg-accent md:bg-transparent"
        >
          <div className="flex items-center justify-between space-x-2 p-4">
            <span className="text-[15px] font-medium text-accent-foreground md:text-foreground lg:text-base">
              {row.feature}
            </span>
            {row.tooltip ? (
              <Popover>
                <PopoverTrigger className="rounded p-1 hover:bg-muted">
                  <Info className="size-[18px] text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent side="top" className="max-w-80 p-3 text-sm">
                  {row.tooltip}
                </PopoverContent>
              </Popover>
            ) : null}
          </div>
        </td>
        {rowCells}
      </tr>
    );
  });

  return (
    <MaxWidthWrapper>
      <HeaderSection
        label="Plans"
        title="Compare Our Plans"
        subtitle="Find the perfect plan tailored for your business needs!"
      />

      <div className="my-10 overflow-x-scroll max-lg:mx-[-0.8rem] md:overflow-x-visible">
        <table className="w-full table-fixed">
          <thead>
            <tr className="divide-x divide-border border">
              <th className="sticky left-0 z-20 w-40 bg-accent p-5 md:w-1/4 lg:top-14"></th>
              {headerColumns}
            </tr>
          </thead>
          <tbody className="divide-x divide-border border">{tableRows}</tbody>
        </table>
      </div>
    </MaxWidthWrapper>
  );
}
