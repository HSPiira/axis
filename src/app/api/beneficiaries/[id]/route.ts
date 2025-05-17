import { NextRequest, NextResponse } from "next/server";
import { BeneficiaryProvider } from "@/lib/providers/beneficiary-provider";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { BaseStatus, Language, RelationType } from "@prisma/client";

const provider = new BeneficiaryProvider();

const updateBeneficiarySchema = z.object({
  profileId: z.string().optional(),
  relation: z.nativeEnum(RelationType).optional(),
  isStaffLink: z.boolean().optional(),
  staffId: z.string().optional(),
  guardianId: z.string().optional().nullable(),
  userLinkId: z.string().optional().nullable(),
  status: z.nativeEnum(BaseStatus).optional(),
  preferredLanguage: z.nativeEnum(Language).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const limiter = await rateLimit.check(request, 100, "1m");
    if (!limiter.success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const beneficiary = await provider.get(id);
    if (!beneficiary) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }
    return NextResponse.json(beneficiary);
  } catch (error) {
    console.error("Error fetching beneficiary:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const limiter = await rateLimit.check(request, 50, "1m");
    if (!limiter.success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await request.json();
    const validatedData = updateBeneficiarySchema.parse(data);
    const { id } = await params;
    const beneficiary = await provider.update(id, validatedData);
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "Beneficiary",
        entityId: beneficiary.id,
        userId: session.user.id,
      },
    });
    return NextResponse.json(beneficiary);
  } catch (error) {
    console.error("Error updating beneficiary:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation Error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const limiter = await rateLimit.check(request, 50, "1m");
    if (!limiter.success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await provider.delete(id);
    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entityType: "Beneficiary",
        entityId: id,
        userId: session.user.id,
      },
    });
    return NextResponse.json({ message: "Beneficiary deleted successfully" });
  } catch (error) {
    console.error("Error deleting beneficiary:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
