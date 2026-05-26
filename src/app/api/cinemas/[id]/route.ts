import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { cinemaSchema } from "@/features/cinemas/schemas/cinema.schema";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const values = cinemaSchema.parse(body);

    const existingCinema = await prisma.cinema.findUnique({
      where: {
        id,
      },
    });

    if (!existingCinema) {
      return NextResponse.json(
        {
          message: "Cinema not found",
        },
        {
          status: 404,
        }
      );
    }

    let slug = existingCinema.slug;

    if (existingCinema.name !== values.name) {
      const baseSlug = slugify(values.name);
      slug = baseSlug;

      let counter = 1;

      while (
        await prisma.cinema.findFirst({
          where: {
            slug,
            NOT: {
              id,
            },
          },
        })
      ) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const cinema = await prisma.cinema.update({
      where: {
        id,
      },
      data: {
        name: values.name,
        slug,
        address: values.address,
        city: values.city,
        phone: values.phone || null,
        description: values.description || null,
        isActive: values.isActive,
      },
    });

    return NextResponse.json({
      message: "Cinema updated successfully",
      data: cinema,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.issues?.[0]?.message || "Failed to update cinema",
      },
      {
        status: 400,
      }
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params;

    await prisma.cinema.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Cinema deleted successfully",
    });
  } catch {
    return NextResponse.json(
      {
        message: "Failed to delete cinema",
      },
      {
        status: 400,
      }
    );
  }
}