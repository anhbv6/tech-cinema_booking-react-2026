import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { cinemaSchema } from "@/features/cinemas/schemas/cinema.schema";
import { slugify } from "@/lib/utils";

export async function GET() {
    try {
        const cinemas = await prisma.cinema.findMany({
        orderBy: {
            createdAt: "desc",
        },
        });

        return NextResponse.json({
        data: cinemas,
        });
    } catch {
        return NextResponse.json(
        {
            message: "Failed to fetch cinemas",
        },
        {
            status: 500,
        }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const values = cinemaSchema.parse(body);

        const baseSlug = slugify(values.name);

        let slug = baseSlug;
        let counter = 1;

        while (await prisma.cinema.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
        }

        const cinema = await prisma.cinema.create({
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
        message: "Cinema created successfully",
        data: cinema,
        });
    } catch (error: any) {
        return NextResponse.json(
        {
            message: error?.issues?.[0]?.message || "Failed to create cinema",
        },
        {
            status: 400,
        }
        );
    }
}