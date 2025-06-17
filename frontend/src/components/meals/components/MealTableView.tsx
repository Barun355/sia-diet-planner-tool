import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProductsCreateManyInput } from "@/types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BACKEND_BASE_API, BACKEND_PRODUCT_ROUTE } from "@/lib/constant";
import { LazyLoadImage } from "react-lazy-load-image-component";
import PlaceHolder from "@/assets/placeholder.jpg";

import axios from "axios";
import { useEditDialog } from "./products/ProductUpdateDialogContext";
import { EditDialog } from "./products/ProductUpdateDialog";
import { updateProduct } from "@/lib/products.action";
import FileImport from "./ui/FileImport";
import { toast } from "sonner";

export const columns: ColumnDef<ProductsCreateManyInput>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "slno",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          SL No.
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="w-full flex justify-center items-center">
        {row.getValue("slno")}
      </div>
    ),
  },
  {
    accessorKey: "itemDescription",
    header: "Item Description",
    cell: ({ row }) => (
      <div className="lowercase w-[30rem] text-wrap">
        {row.getValue("itemDescription")}
      </div>
    ),
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: ({ row }) => (
      <div className="lowercase w-[26rem] text-wrap">
        {row.getValue("remarks")}
      </div>
    ),
  },
  {
    accessorKey: "vendorName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Vendor Name
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("vendorName")}</div>
    ),
  },
  {
    accessorKey: "vendorRate",
    header: "Vendor Rate",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("vendorRate"));

      // Format the amount as a dollar amount
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "INR",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "location",
    header: "Locations",
    cell: ({ row }) => (
      <div className="capitalize w-[6rem] text-wrap">
        {row.getValue("location")}
      </div>
    ),
  },
  {
    accessorKey: "image",
    header: "Images",
    cell: ({ row }) => (
      <div className="h-20 w-20 text-wrap overflow-hidden rounded-md flex justify-center items-center">
        <LazyLoadImage
          src={
            row.getValue("image") != "" ? row.getValue("image") : PlaceHolder
          }
          alt={row.getValue("image")}
          placeholderSrc={PlaceHolder}
          className="h-20 w-20 rounded-md object-cover"
        />
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const { openDialog } = useEditDialog();
      const product = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => openDialog(product)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const formSchema = z.object({
  slno: z.number(),
  itemDescription: z
    .string()
    .min(5, { message: "Item Description must be atleast 5 letter" }),
  location: z
    .string()
    .min(3, { message: "Location name should be atleast 3 letter" }),
  remarks: z.string().min(5, { message: "Remark should be atleast 5 letter" }),
  vendorName: z
    .string()
    .min(5, { message: "Vendor Name should be atleast 5 letter" }),
  vendorRate: z.number(),
});

export function FileTableView({
  products,
  totalPage,
  pagination,
  setProducts,
  setTotalPage,
  setPagination,
}: {
  products: ProductsCreateManyInput[];
  totalPage: number;
  pagination: {
    pageSize: number;
    pageIndex: number;
  };
  setPagination: (pagination: PaginationState) => void;
  setProducts: (products: ProductsCreateManyInput[]) => void;
  setTotalPage: (pageCount: number) => void;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [newProductImage, setNewProductImage] = React.useState<File | null>(
    null
  );
  const [newProductLoading, setNewProductLoading] = React.useState(false);
  const [createProductDialog, setCreateProductDialog] = React.useState(false);

  const table = useReactTable({
    data: products,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    pageCount: totalPage,
    manualPagination: true,
    onPaginationChange: setPagination as any,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    initialState: {
      pagination,
    },
  });

  const [filterValue, setFilterValue] = React.useState<
    "itemDescription" | "vendorName"
  >("itemDescription");

  React.useEffect(() => {
    (async () => {
      console.log("calling api on change pageSize, pageIndex");
      const res: any = await axios.get(
        `${BACKEND_BASE_API}/${BACKEND_PRODUCT_ROUTE}?pageSize=${
          pagination.pageSize
        }&pageIndex=${pagination.pageIndex + 1}`
      );
      if (res.data.data?.products?.length > 0) {
        setProducts(res.data.data.products);
        setTotalPage(res.data.data.totalPage);
      }
    })();
  }, [pagination.pageSize, pagination.pageIndex]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemDescription: "",
      slno: 0,
      location: "",
      remarks: "",
      vendorName: "",
      vendorRate: 0,
    },
  });

  const addProduct = async (values: z.infer<typeof formSchema>) => {
    
    if (!newProductImage) {
      toast.error("image");
      return;
    }

    console.log(values);
    const newFormData = new FormData();
    newFormData.append("productImage", newProductImage);
    newFormData.append("itemDescription", values.itemDescription);
    newFormData.append("location", values.location);
    newFormData.append("remarks", values.remarks);
    newFormData.append("slno", String(values.slno));
    newFormData.append("vendorName", values.vendorName);
    newFormData.append("vendorRate", String(values.vendorRate));

    try {
      setNewProductLoading(true);
      const res: any = await axios.post(
        `${BACKEND_BASE_API}/${BACKEND_PRODUCT_ROUTE}`,
        newFormData
      );

      console.log(res.data);
      if (res.data.error) {
        toast.error(res.data.message);
      }

      if (res.data.data.id) {
        toast.success(res.data.message);
        setProducts([{ ...res.data.data }, ...products]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setNewProductLoading(false);
      setCreateProductDialog(false);
    }
  };

  return (
    <div className="w-full">
      <EditDialog onSave={updateProduct} />
      <div className="flex items-center justify-between py-4">
        <div className="flex gap-4 justify-center w-fit">
          <Input
            placeholder={`Filter ${filterValue}...`}
            value={table.getColumn(filterValue)?.getFilterValue() as any}
            onChange={(event) => {
              table.getColumn(filterValue)?.setFilterValue(event.target.value);
            }}
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Filter Field <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setFilterValue("itemDescription")}
              >
                Item Description
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterValue("vendorName")}>
                Vendor Name
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex gap-4 w-fit">
          <Dialog
            open={createProductDialog}
            onOpenChange={setCreateProductDialog}
          >
            <DialogTrigger asChild>
              <Button className="font-semibold cursor-pointer">
                Create Products
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] min-w-[40rem]">
              <DialogHeader>
                <DialogTitle>Create Product</DialogTitle>
                <DialogDescription>
                  Fill the details required to create product
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(addProduct)}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-2 gap-4 space-x-6">
                      <FormField
                        control={form.control}
                        name="slno"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sl no.</FormLabel>
                            <FormControl>
                              <Input placeholder="slno" {...field} />
                            </FormControl>
                            <FormDescription>
                              Serial number of the product should be unique.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="itemDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="item description"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Description of the product
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="location" {...field} />
                            </FormControl>
                            <FormDescription>
                              Location of the product
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="remarks"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Remarks</FormLabel>
                            <FormControl>
                              <Input placeholder="remakrs" {...field} />
                            </FormControl>
                            <FormDescription>
                              Remarks of the product
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="vendorName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vendor Name</FormLabel>
                            <FormControl>
                              <Input placeholder="vendorName" {...field} />
                            </FormControl>
                            <FormDescription>
                              Vendor Name for the product
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="vendorRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vendor Rate</FormLabel>
                            <FormControl>
                              <Input placeholder="vendorRate" {...field} />
                            </FormControl>
                            <FormDescription>
                              Vendor Rate for the product
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FileImport
                      onFileSelect={(file: File) => setNewProductImage(file)}
                      onFileRemove={() => setNewProductImage(null)}
                      acceptedExtensions={[".jpg", ".jpeg", ".png"]}
                      acceptedTypes={["image/png", "image/jpeg"]}
                    />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit" loading={newProductLoading}>
                        Add Product
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown />
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
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
