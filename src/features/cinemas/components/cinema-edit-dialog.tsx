"use client";

import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { api } from "@/lib/axios";
import {
  cinemaSchema,
  type CinemaFormValues,
} from "@/features/cinemas/schemas/cinema.schema";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Cinema = {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string | null;
  description: string | null;
  isActive: boolean;
};

type CinemaEditDialogProps = {
  cinema: Cinema | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CinemaEditDialog({
  cinema,
  open,
  onOpenChange,
}: CinemaEditDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CinemaFormValues>({
    resolver: zodResolver(cinemaSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      phone: "",
      description: "",
      isActive: true,
    },
  });

  const isActive = watch("isActive");

  useEffect(() => {
    if (!cinema) return;

    reset({
      name: cinema.name,
      address: cinema.address,
      city: cinema.city,
      phone: cinema.phone || "",
      description: cinema.description || "",
      isActive: cinema.isActive,
    });
  }, [cinema, reset]);

  const updateCinemaMutation = useMutation({
    mutationFn: async (values: CinemaFormValues) => {
      if (!cinema) return null;

      const response = await api.patch(`/cinemas/${cinema.id}`, values);

      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Cinema updated successfully");
      queryClient.invalidateQueries({ queryKey: ["cinemas"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to update cinema";
      toast.error(message);
    },
  });

  function onSubmit(values: CinemaFormValues) {
    updateCinemaMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit cinema</DialogTitle>
          <DialogDescription>
            Update cinema information and availability.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Cinema name</Label>
              <Input
                id="name"
                placeholder="CGV Vincom Center"
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Ho Chi Minh"
                {...register("city")}
              />
              {errors.city ? (
                <p className="text-sm text-red-500">{errors.city.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="72 Le Thanh Ton, District 1"
              {...register("address")}
            />
            {errors.address ? (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="0909 123 456"
              {...register("phone")}
            />
            {errors.phone ? (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Short description about this cinema..."
              {...register("description")}
            />
            {errors.description ? (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-zinc-100 p-4">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => {
                setValue("isActive", checked === true, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            />

            <div className="space-y-1">
              <Label htmlFor="isActive">Active cinema</Label>
              <p className="text-sm text-zinc-500">
                Inactive cinemas will not be available for new rooms or
                showtimes.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={updateCinemaMutation.isPending}
              className="cursor-pointer bg-[#1DE782] text-zinc-950 hover:bg-[#19D675]"
            >
              {updateCinemaMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}