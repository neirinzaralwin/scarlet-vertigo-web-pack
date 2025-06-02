'use client';

import * as React from 'react';
import { useState } from 'react';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { IconChevronDown, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconDotsVertical, IconEdit, IconEye, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DashboardLayout } from '@/components/dashboard-layout';

// Product type definition
export type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    status: 'active' | 'inactive' | 'out-of-stock';
    image: string;
    sku: string;
    createdAt: string;
};

// Sample product data with network images
const sampleProducts: Product[] = [
    {
        id: '1',
        name: 'Nike Air Force 1',
        description: 'Classic white leather sneakers with iconic design',
        price: 120.0,
        category: 'Sneakers',
        stock: 45,
        status: 'active',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
        sku: 'AF1-WHITE-001',
        createdAt: '2024-01-15',
    },
    {
        id: '2',
        name: 'Adidas Ultra Boost',
        description: 'Premium running shoes with responsive cushioning',
        price: 180.0,
        category: 'Running',
        stock: 23,
        status: 'active',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        sku: 'UB-BLACK-002',
        createdAt: '2024-01-20',
    },
    {
        id: '3',
        name: 'Converse Chuck Taylor',
        description: 'Timeless canvas high-top sneakers',
        price: 65.0,
        category: 'Casual',
        stock: 0,
        status: 'out-of-stock',
        image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=400&h=400&fit=crop',
        sku: 'CT-RED-003',
        createdAt: '2024-01-10',
    },
    {
        id: '4',
        name: 'Vans Old Skool',
        description: 'Iconic skate shoe with waffle outsole',
        price: 85.0,
        category: 'Skateboarding',
        stock: 67,
        status: 'active',
        image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=400&fit=crop',
        sku: 'OS-BLACK-004',
        createdAt: '2024-01-25',
    },
    {
        id: '5',
        name: 'New Balance 990v5',
        description: 'Made in USA premium lifestyle sneaker',
        price: 200.0,
        category: 'Lifestyle',
        stock: 12,
        status: 'active',
        image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop',
        sku: 'NB990-GREY-005',
        createdAt: '2024-01-30',
    },
    {
        id: '6',
        name: 'Jordan 1 Retro High',
        description: 'Basketball legend in premium leather',
        price: 170.0,
        category: 'Basketball',
        stock: 8,
        status: 'active',
        image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=400&fit=crop',
        sku: 'J1-BRED-006',
        createdAt: '2024-02-01',
    },
    {
        id: '7',
        name: 'Puma Suede Classic',
        description: 'Retro basketball shoe with suede upper',
        price: 70.0,
        category: 'Lifestyle',
        stock: 34,
        status: 'active',
        image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=400&h=400&fit=crop',
        sku: 'PS-BLUE-007',
        createdAt: '2024-02-05',
    },
    {
        id: '8',
        name: 'Reebok Club C 85',
        description: 'Vintage tennis-inspired sneaker',
        price: 75.0,
        category: 'Tennis',
        stock: 19,
        status: 'inactive',
        image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop',
        sku: 'CC85-WHITE-008',
        createdAt: '2024-02-10',
    },
    {
        id: '9',
        name: 'ASICS Gel Kayano',
        description: 'Stability running shoe with gel cushioning',
        price: 160.0,
        category: 'Running',
        stock: 27,
        status: 'active',
        image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop',
        sku: 'GK-NAVY-009',
        createdAt: '2024-02-15',
    },
    {
        id: '10',
        name: 'Under Armour Curry 9',
        description: 'Signature basketball shoe with UA Flow',
        price: 140.0,
        category: 'Basketball',
        stock: 15,
        status: 'active',
        image: 'https://images.unsplash.com/photo-1615464666149-4aaf0e8d61cb?w=400&h=400&fit=crop',
        sku: 'UC9-WHITE-010',
        createdAt: '2024-02-20',
    },
];

// Column definitions for the products table
const columns: ColumnDef<Product>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'image',
        header: 'Image',
        cell: ({ row }) => (
            <div className="w-16 h-16">
                <img
                    src={row.original.image}
                    alt={row.original.name}
                    className="w-full h-full object-cover rounded-md"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://via.placeholder.com/400x400/e5e7eb/9ca3af?text=${encodeURIComponent(row.original.name)}`;
                    }}
                />
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: 'name',
        header: 'Product Name',
        cell: ({ row }) => (
            <div className="space-y-1">
                <div className="font-medium">{row.original.name}</div>
                <div className="text-sm text-muted-foreground">{row.original.sku}</div>
            </div>
        ),
    },
    {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
            <div className="max-w-xs">
                <p className="text-sm text-muted-foreground line-clamp-2">{row.original.description}</p>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => (
            <Badge variant="outline" className="font-normal">
                {row.original.category}
            </Badge>
        ),
    },
    {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => <div className="font-medium">${row.original.price.toFixed(2)}</div>,
    },
    {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }) => {
            const stock = row.original.stock;
            return (
                <div className="flex items-center space-x-2">
                    <span className={stock === 0 ? 'text-red-600' : stock < 20 ? 'text-yellow-600' : 'text-green-600'}>{stock}</span>
                    {stock === 0 && (
                        <Badge variant="destructive" className="text-xs">
                            Out
                        </Badge>
                    )}
                    {stock > 0 && stock < 20 && (
                        <Badge variant="secondary" className="text-xs">
                            Low
                        </Badge>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status;
            return <Badge variant={status === 'active' ? 'default' : status === 'inactive' ? 'secondary' : 'destructive'}>{status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}</Badge>;
        },
    },
    {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => <div className="text-sm text-muted-foreground">{new Date(row.original.createdAt).toLocaleDateString()}</div>,
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const product = row.original;

            return (
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => alert(`Viewing product: ${product.name}`)}>
                        <IconEye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => alert(`Editing product: ${product.name}`)}>
                        <IconEdit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => {
                            if (confirm(`Are you sure you want to delete ${product.name}?`)) {
                                alert(`Deleted product: ${product.name}`);
                            }
                        }}
                    >
                        <IconTrash className="h-4 w-4" />
                    </Button>
                </div>
            );
        },
        enableSorting: false,
    },
];

export default function Page() {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState('');

    const table = useReactTable({
        data: sampleProducts,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: 'includesString',
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
        initialState: {
            pagination: {
                pageSize: 5,
            },
        },
    });

    return (
        <DashboardLayout>
            <div className="space-y-6 p-6">
                {/* Filters and Controls */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex justify-between items-center w-full">
                            <CardTitle className="text-lg">Product Management</CardTitle>
                            <Button variant="outline" size="sm">
                                Create
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-4 mb-4">
                            {/* Global Search */}
                            <div className="flex-1 relative">
                                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input placeholder="Search products..." value={globalFilter ?? ''} onChange={(event) => setGlobalFilter(event.target.value)} className="pl-10" />
                            </div>

                            {/* Category Filter */}
                            <Select
                                value={(table.getColumn('category')?.getFilterValue() as string) ?? ''}
                                onValueChange={(value) => table.getColumn('category')?.setFilterValue(value === 'all' ? '' : value)}
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Filter by category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Status Filter */}
                            <Select
                                value={(table.getColumn('status')?.getFilterValue() as string) ?? ''}
                                onValueChange={(value) => table.getColumn('status')?.setFilterValue(value === 'all' ? '' : value)}
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Column Visibility */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        Columns <IconChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {table
                                        .getAllColumns()
                                        .filter((column) => column.getCanHide())
                                        .map((column) => {
                                            return (
                                                <DropdownMenuCheckboxItem
                                                    key={column.id}
                                                    className="capitalize"
                                                    checked={column.getIsVisible()}
                                                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                                >
                                                    {column.id}
                                                </DropdownMenuCheckboxItem>
                                            );
                                        })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Selected Items Actions */}
                        {table.getFilteredSelectedRowModel().rows.length > 0 && (
                            <div className="flex items-center space-x-2 mb-4 p-3 bg-muted rounded-md">
                                <span className="text-sm font-medium">
                                    {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
                                </span>
                                <Button variant="outline" size="sm">
                                    Bulk Edit
                                </Button>
                                <Button variant="outline" size="sm">
                                    Export Selected
                                </Button>
                                <Button variant="destructive" size="sm">
                                    Delete Selected
                                </Button>
                            </div>
                        )}

                        {/* Data Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => {
                                                return <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>;
                                            })}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                                No results.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between space-x-2 py-4">
                            <div className="text-sm text-muted-foreground">
                                {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
                            </div>
                            <div className="flex items-center space-x-6 lg:space-x-8">
                                <div className="flex items-center space-x-2">
                                    <p className="text-sm font-medium">Rows per page</p>
                                    <Select
                                        value={`${table.getState().pagination.pageSize}`}
                                        onValueChange={(value) => {
                                            table.setPageSize(Number(value));
                                        }}
                                    >
                                        <SelectTrigger className="h-8 w-[70px]">
                                            <SelectValue placeholder={table.getState().pagination.pageSize} />
                                        </SelectTrigger>
                                        <SelectContent side="top">
                                            {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                                    {pageSize}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                                        <span className="sr-only">Go to first page</span>
                                        <IconChevronsLeft className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                                        <span className="sr-only">Go to previous page</span>
                                        <IconChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                                        <span className="sr-only">Go to next page</span>
                                        <IconChevronRight className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                                        <span className="sr-only">Go to last page</span>
                                        <IconChevronsRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
