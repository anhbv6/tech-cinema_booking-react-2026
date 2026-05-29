"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { api } from "@/lib/axios";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

type UserStatusDialogProps = {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UserStatusDialog({
  user,
  open,
  onOpenChange,
}: UserStatusDialogProps) {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;

      const response = await api.patch(`/users/${user.id}/status`, {
        isActive: !user.isActive,
      });

      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "User status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to update user status";
      toast.error(message);
    },
  });

  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {user.isActive ? "Deactivate user?" : "Activate user?"}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {user.isActive
              ? "This user will no longer be able to access the system."
              : "This user will be allowed to access the system again."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
          <p className="font-medium text-zinc-950">
            {user.name || "Unnamed user"}
          </p>
          <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={updateStatusMutation.isPending}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button
              type="button"
              variant={user.isActive ? "destructive" : "default"}
              onClick={() => updateStatusMutation.mutate()}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending
                ? "Saving..."
                : user.isActive
                  ? "Deactivate"
                  : "Activate"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}