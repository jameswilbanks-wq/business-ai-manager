import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

export interface DataGridColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
  headClassName?: string;
}

interface DataGridProps<T> {
  columns: DataGridColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
}

/**
 * Shared table pattern for every module list screen (Customers, Orders,
 * Inventory, Tasks, ...). Handles loading skeletons and the empty state so
 * feature code only supplies columns + data.
 */
function DataGrid<T>({
  columns,
  data,
  rowKey,
  isLoading,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  onRowClick,
  className,
}: DataGridProps<T>) {
  if (!isLoading && data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} icon={emptyIcon} />;
  }

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col.key} className={col.headClassName}>
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    <Skeleton className="h-4 w-full max-w-40" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : data.map((row) => (
              <TableRow
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(onRowClick && "cursor-pointer")}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
}

export { DataGrid };
