"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CinemaCreateDialog() {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);

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

  const createCinemaMutation = useMutation({
    mutationFn: async (values: CinemaFormValues) => {
      const response = await api.post("/cinemas", values);

      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Cinema created successfully");
      queryClient.invalidateQueries({ queryKey: ["cinemas"] });
      reset();
      setOpen(false);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to create cinema";
      toast.error(message);
    },
  });

  function onSubmit(values: CinemaFormValues) {
    createCinemaMutation.mutate(values);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer bg-[#1DE782] text-zinc-950 hover:bg-[#19D675]">
          <Plus size={16} className="mr-2" />
          Add cinema
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create cinema</DialogTitle>
          <DialogDescription>
            Add a new cinema location to your system.
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
                Active cinemas can be used when creating rooms and showtimes.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={createCinemaMutation.isPending}
              className="cursor-pointer bg-[#1DE782] text-zinc-950 hover:bg-[#19D675]"
            >
              {createCinemaMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}