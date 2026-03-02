import { NextResponse } from "next/server";
import { ContactFormSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = ContactFormSchema.parse(body);

    // In production, send email via Resend
    console.log("Contact form submission:", validated);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error sending message" },
      { status: 500 }
    );
  }
}
