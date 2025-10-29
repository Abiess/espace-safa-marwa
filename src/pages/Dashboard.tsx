import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Receipt as ReceiptIcon, DollarSign, FileText, CheckCircle, Download, Filter } from 'lucide-react';
import { useReceipts } from '@/hooks/use-receipts';
import { KpiCard } from '@/components/KpiCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateShort } from '@/lib/format';
import { exportReceiptsToCSV, exportReceiptsToJSON } from '@/lib/export';
import type { Receipt } from '@/lib/schemas';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: receipts = [], isLoading } = useReceipts();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState(searchParams.get('search') || '');

  const statusFilter = searchParams.get('status') || 'all';
  const lowConfidence = searchParams.get('lowConfidence') === 'true';

  const filteredReceipts = useMemo(() => {
    let filtered = receipts;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (lowConfidence) {
      filtered = filtered.filter((r) => r.confidenceOverall < 0.85);
    }

    if (globalFilter) {
      const search = globalFilter.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.vendor.toLowerCase().includes(search) ||
          r.receiptNo?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [receipts, statusFilter, lowConfidence, globalFilter]);

  const kpis = useMemo(() => {
    const verifiedReceipts = receipts.filter((r) => r.status === 'verified');
    const totalAmount = verifiedReceipts.reduce((sum, r) => sum + r.total, 0);
    const thisMonth = receipts.filter((r) => {
      const date = new Date(r.dateTime);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    const avgConfidence = receipts.length > 0
      ? receipts.reduce((sum, r) => sum + r.confidenceOverall, 0) / receipts.length
      : 0;

    return {
      totalAmount,
      monthlyReceipts: thisMonth.length,
      verifiedPercent: receipts.length > 0 ? (verifiedReceipts.length / receipts.length) * 100 : 0,
      avgConfidence: avgConfidence * 100,
    };
  }, [receipts]);

  const columns: ColumnDef<Receipt>[] = [
    {
      accessorKey: 'dateTime',
      header: 'Date',
      cell: ({ row }) => formatDateShort(row.original.dateTime),
    },
    {
      accessorKey: 'vendor',
      header: 'Vendor',
    },
    {
      accessorKey: 'receiptNo',
      header: 'Receipt No',
      cell: ({ row }) => row.original.receiptNo || '-',
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => formatCurrency(row.original.total),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'verified' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'confidenceOverall',
      header: 'Confidence',
      cell: ({ row }) => {
        const conf = row.original.confidenceOverall;
        const variant = conf >= 0.9 ? 'default' : conf >= 0.75 ? 'secondary' : 'destructive';
        return <Badge variant={variant}>{(conf * 100).toFixed(0)}%</Badge>;
      },
    },
  ];

  const table = useReactTable({
    data: filteredReceipts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'all') {
      params.delete('status');
    } else {
      params.set('status', value);
    }
    setSearchParams(params);
  };

  const handleLowConfidenceToggle = () => {
    const params = new URLSearchParams(searchParams);
    if (lowConfidence) {
      params.delete('lowConfidence');
    } else {
      params.set('lowConfidence', 'true');
    }
    setSearchParams(params);
  };

  const handleSearch = (value: string) => {
    setGlobalFilter(value);
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total (Verified)"
          value={formatCurrency(kpis.totalAmount)}
          icon={<DollarSign size={20} />}
          loading={isLoading}
        />
        <KpiCard
          title="This Month"
          value={kpis.monthlyReceipts}
          icon={<ReceiptIcon size={20} />}
          loading={isLoading}
        />
        <KpiCard
          title="Verified"
          value={`${kpis.verifiedPercent.toFixed(0)}%`}
          icon={<CheckCircle size={20} />}
          loading={isLoading}
        />
        <KpiCard
          title="Avg Confidence"
          value={`${kpis.avgConfidence.toFixed(0)}%`}
          icon={<FileText size={20} />}
          loading={isLoading}
        />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by vendor or receipt no..."
            value={globalFilter}
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={lowConfidence ? 'default' : 'outline'}
            onClick={handleLowConfidenceToggle}
            className="gap-2"
          >
            <Filter size={16} />
            Low Confidence
          </Button>
          <div className="ml-auto flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download size={16} />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => exportReceiptsToCSV(filteredReceipts)}>
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportReceiptsToJSON(filteredReceipts.map(r => ({ ...r, lines: [] })))}>
                  Export JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/r/${row.original.id}`)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No receipts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {table.getRowModel().rows.length} of {filteredReceipts.length} receipts
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
