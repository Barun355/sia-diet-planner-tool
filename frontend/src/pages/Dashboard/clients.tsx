import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserStore } from "@/store/user.store";
import type { ClientTableInterface } from "@/types";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import React, { useState } from "react";
import GlobalErrorPage from "../global-error";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";
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
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import axios from "axios";
import { BACKEND_BASE_ROUTE, ROUTE_CLIENT } from "@/lib/constant";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const columns: ColumnDef<ClientTableInterface>[] = [
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
    accessorKey: "userName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Username
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="w-fit flex justify-center items-center md:pl-2">
        {row.getValue("userName")}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const original = row.original;
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
            <DropdownMenuItem asChild>
              <Link to={`/dashboard/history?clientId=${original.id}`}>
                History
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const addClientSchema = z.object({
  firstName: z.string().min(4, {
    message: "First name should be atleast 4 letters long.",
  }),
  lastName: z.string().min(4, {
    message: "Last name should be atleast 4 letters long.",
  }),
  coachId: z.string(),
  email: z.string().email("This field only accept email."),
  contactNumber: z
    .string()
    .min(10, {
      message: "The contact number should be 10 digit.",
    })
    .max(10, {
      message: "The contact number should be 10 digit.",
    }),
});

const Client = () => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isLoadingAddClient, setIsLoadingAddClient] = useState(false);
  const [addClientDialog, setAddClientDialog] = useState(false);

  const { getToken } = useAuth();

  const clientList = useUserStore((state) => state.clientList);
  const teamList = useUserStore((state) => state.teamList);
  const currentUser = useUserStore((state) => state.user);
  const role = currentUser?.publicMetadata.role

  const table = useReactTable({
    data: clientList,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const form = useForm<z.infer<typeof addClientSchema>>({
    defaultValues: {
      firstName: "",
      lastName: "",
      coachId: "",
      email: "",
      contactNumber: "",
    },
  });

  console.log(clientList);

  const handleAddNewClient = async (
    values: z.infer<typeof addClientSchema>
  ) => {
    setIsLoadingAddClient(true);
    console.log("handle new client");
    try {
      const token = await getToken();
      const res: any = await axios.post(
        `${BACKEND_BASE_ROUTE}/${ROUTE_CLIENT}`,
        values,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res.data);
      if (res.data?.data?.id) {
        toast.success("Client added.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Client not added");
    } finally {
      setIsLoadingAddClient(false);
      form.resetField("coachId");
      form.resetField("contactNumber");
      form.resetField("email");
      form.resetField("firstName");
      form.resetField("lastName");
      setAddClientDialog(false);
    }
  };

  if (!clientList) return <GlobalErrorPage />;

  return (
    <div className="w-full flex flex-col items-start justify-center py-4g gap-2">
      <div className="flex gap-4 justify-between items-center w-full">
        <Input
          placeholder={`Filter by username`}
          value={table.getColumn("userName")?.getFilterValue() as any}
          onChange={(event) => {
            table.getColumn("userName")?.setFilterValue(event.target.value);
          }}
          className="max-w-sm"
        />

        {role === "team" && (
          <Dialog open={addClientDialog} onOpenChange={setAddClientDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">Add Client</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddNewClient)}>
                  <DialogHeader>
                    <DialogTitle>Add client</DialogTitle>
                    <DialogDescription>
                      Add new client. Hit save button to add client.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-3">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <Input
                              id="firstName"
                              name="firstName"
                              type="text"
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="firstName"
                              required
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-3">
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <Input
                              id="lastName"
                              name="lastName"
                              type="text"
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="lastName"
                              required
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-3">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="email"
                              inputMode="email"
                              required
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-3">
                      <FormField
                        control={form.control}
                        name="contactNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Number</FormLabel>
                            <Input
                              id="contact"
                              name="contactNumber"
                              type="number"
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="contact number"
                              inputMode="numeric"
                              required
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-3">
                      <FormField
                        control={form.control}
                        name="coachId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assign Coach</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="min-w-full">
                                  <SelectValue placeholder="Select Coach" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {teamList &&
                                  teamList.length > 0 &&
                                  teamList.map((team) => {
                                    console.log(team);
                                    return (
                                      <SelectItem value={team.id} key={team.id}>
                                        {team?.firstName}
                                      </SelectItem>
                                    );
                                  })}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <DialogFooter className="mt-4">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" loading={isLoadingAddClient}>
                      Save Client
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="rounded-md border w-full">
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
                  No client assigned yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Client;
