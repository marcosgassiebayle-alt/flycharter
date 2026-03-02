import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { RegisterSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = RegisterSchema.parse(body);

    const existing = await prisma.operator.findUnique({
      where: { email: validated.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este email" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(validated.password, 12);

    const operator = await prisma.operator.create({
      data: {
        email: validated.email,
        passwordHash,
        name: validated.name,
        companyName: validated.companyName,
        phone: validated.phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
        phone: true,
        verified: true,
        createdAt: true,
      },
    });

    return NextResponse.json(operator, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error al crear la cuenta" },
      { status: 500 }
    );
  }
}
