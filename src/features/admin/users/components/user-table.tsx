"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { MoreHorizontal, Search } from "lucide-react";

import { api } from "@/lib/axios";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { UserRoleDialog } from "./user-role-dialog";
import { UserStatusDialog } from "./user-status-dialog";

type UserRole = "ADMIN" | "MANAGER" | "STAFF" | "CUSTOMER";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type UsersResponse = {
  data: User[];
};

type RoleFilter = UserRole | "ALL";
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

function getInitials(name: string | null, email: string) {
  if (!name) return email.slice(0, 2).toUpperCase();

  return name
    .split(" ")
    .map((item) => item[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getRoleBadgeClassName(role: UserRole) {
  switch (role) {
    case "ADMIN":
      return "bg-red-100 text-red-700 hover:bg-red-100";
    case "MANAGER":
      return "bg-purple-100 text-purple-700 hover:bg-purple-100";
    case "STAFF":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    case "CUSTOMER":
      return "bg-zinc-100 text-zinc-700 hover:bg-zinc-100";
    default:
      return "";
  }
}

export function UserTable() {
  const [searchValue, setSearchValue] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [roleUser, setRoleUser] = useState<User | null>(null);
  const [statusUser, setStatusUser] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get<UsersResponse>("/users");

      return response.data.data;
    },
  });

  const filteredUsers = useMemo(() => {
    if (!data) return [];

    const keyword = searchValue.trim().toLowerCase();

    return data.filter((user) => {
      const matchesSearch =
        !keyword ||
        user.name?.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword);

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && user.isActive) ||
        (statusFilter === "INACTIVE" && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [data, searchValue, roleFilter, statusFilter]);

  return (
    <>
      <div className="rounded-2xl border border-zinc-100 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 p-4">
          <div>
            <h2 className="font-semibold text-zinc-950">User list</h2>
            <p className="mt-1 text-sm text-zinc-500">
              View users, update roles, and manage account access.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <div className="relative w-full sm:w-80">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />

              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search users..."
                className="pl-9"
              />
            </div>

            <Select
              value={roleFilter}
              onValueChange={(value) => setRoleFilter(value as RoleFilter)}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ALL">All roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as StatusFilter)
              }
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ALL">All status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[80px] text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-28 text-center text-sm text-zinc-500"
                  >
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : null}

              {!isLoading && !filteredUsers.length ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-28 text-center text-sm text-zinc-500"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              ) : null}

              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback>
                          {getInitials(user.name, user.email)}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="font-medium text-zinc-950">
                          {user.name || "Unnamed user"}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {user.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className="text-sm text-zinc-700">{user.email}</p>
                  </TableCell>

                  <TableCell>
                    <Badge className={getRoleBadgeClassName(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {user.isActive ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <p className="text-sm text-zinc-600">
                      {format(new Date(user.createdAt), "dd/MM/yyyy")}
                    </p>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer"
                        >
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => setRoleUser(user)}
                        >
                          Change role
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className={
                            user.isActive
                              ? "cursor-pointer text-red-600 focus:text-red-600"
                              : "cursor-pointer"
                          }
                          onClick={() => setStatusUser(user)}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <UserRoleDialog
        user={roleUser}
        open={!!roleUser}
        onOpenChange={(open) => {
          if (!open) setRoleUser(null);
        }}
      />

      <UserStatusDialog
        user={statusUser}
        open={!!statusUser}
        onOpenChange={(open) => {
          if (!open) setStatusUser(null);
        }}
      />
    </>
  );
}