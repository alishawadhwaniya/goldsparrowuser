import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-xs xxs:text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-8 xxs:h-10 sm:h-12 px-2 xxs:px-3 sm:px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 whitespace-nowrap",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-2 xxs:p-3 sm:p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-3 xxs:mt-4 text-xs xxs:text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

// New responsive table components

// Use this for tables that need to be displayed on small screens
const ResponsiveTable = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "w-full overflow-x-auto rounded-md border",
      className
    )}
    {...props}
  />
))
ResponsiveTable.displayName = "ResponsiveTable"

// Use this to make specific columns hideable on small screens
const HideableTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    hideOnMobile?: boolean;
    hideBelow?: 'sm' | 'md' | 'lg';
  }
>(({ className, hideOnMobile, hideBelow, ...props }, ref) => {
  const hideClasses = hideOnMobile
    ? "hidden md:table-cell"
    : hideBelow === 'sm'
      ? "hidden sm:table-cell"
      : hideBelow === 'md'
        ? "hidden md:table-cell"
        : hideBelow === 'lg'
          ? "hidden lg:table-cell"
          : "";

  return (
    <td
      ref={ref}
      className={cn(
        "p-2 xxs:p-3 sm:p-4 align-middle [&:has([role=checkbox])]:pr-0",
        hideClasses,
        className
      )}
      {...props}
    />
  );
})
HideableTableCell.displayName = "HideableTableCell"

// Use this to make specific header columns hideable on small screens
const HideableTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & {
    hideOnMobile?: boolean;
    hideBelow?: 'sm' | 'md' | 'lg';
  }
>(({ className, hideOnMobile, hideBelow, ...props }, ref) => {
  const hideClasses = hideOnMobile
    ? "hidden md:table-cell"
    : hideBelow === 'sm'
      ? "hidden sm:table-cell"
      : hideBelow === 'md'
        ? "hidden md:table-cell"
        : hideBelow === 'lg'
          ? "hidden lg:table-cell"
          : "";

  return (
    <th
      ref={ref}
      className={cn(
        "h-8 xxs:h-10 sm:h-12 px-2 xxs:px-3 sm:px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 whitespace-nowrap",
        hideClasses,
        className
      )}
      {...props}
    />
  );
})
HideableTableHead.displayName = "HideableTableHead"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  ResponsiveTable,
  HideableTableCell,
  HideableTableHead
}
