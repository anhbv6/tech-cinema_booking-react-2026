"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MovieCreateForm } from "@/features/movies/components/movie-create-form";

export function MovieCreateDialog() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            >
            Create manually
            </Button>
        </DialogTrigger>

        <DialogContent className="max-h-[85vh] max-w-5xl overflow-y-auto">
            <DialogHeader>
            <DialogTitle>Create movie manually</DialogTitle>
            <DialogDescription>
                Add a movie by entering custom movie information.
            </DialogDescription>
            </DialogHeader>

            <MovieCreateForm onCreated={() => setOpen(false)} />
        </DialogContent>
        </Dialog>
    );
}