"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { api } from "@/lib/axios";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

type UserRoleDialogProps = {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const roles: UserRole[] = ["ADMIN", "MANAGER", "STAFF", "CUSTOMER"];

export function UserRoleDialog({
  user,
  open,
  onOpenChange,
}: UserRoleDialogProps) {
  const queryClient = useQueryClient();

  const [role, setRole] = useState<UserRole>("CUSTOMER");

  const updateRoleMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;

      const response = await api.patch(`/users/${user.id}`, {
        role,
      });

      return response.data;
    },
    
    onSuccess: (data) => {
      toast.success(data.message || "User role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      const message =
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { data?: { message?: string } } }).response?.data?.message
          ? (error as { response?: { data?: { message?: string } } }).response!.data!.message!
          : "Failed to update user role";
      toast.error(message);
    },
  });

  function handleSubmit() {
    if (!user) return;

    if (user.role === role) {
      onOpenChange(false);
      return;
    }

    updateRoleMutation.mutate();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen && user) {
          setRole(user.role);
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change user role</DialogTitle>
          <DialogDescription>
            Update this user&apos;s permission level.
          </DialogDescription>
        </DialogHeader>

        {user ? (
          <div className="space-y-5">
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
              <p className="font-medium text-zinc-950">
                {user.name || "Unnamed user"}
              </p>
              <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Role</label>

              <Select
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>

                <SelectContent>
                  {roles.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={updateRoleMutation.isPending}
              >
                {updateRoleMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
