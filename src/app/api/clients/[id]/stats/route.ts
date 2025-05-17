import { NextRequest, NextResponse } from "next/server";
import { StaffProvider } from "@/lib/providers/staff-provider";
import { BeneficiaryProvider } from "@/lib/providers/beneficiary-provider";
import { ContractProvider } from "@/lib/providers/contract-provider";
import { DocumentProvider } from "@/lib/providers/document-provider";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const { clientId } = await params;

    try {
        const limiter = await rateLimit.check(request.headers.get('x-forwarded-for') || 'anonymous');
        if (!limiter.success) {
            return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
        }

        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [staff, beneficiaries, contracts, documents] = await Promise.all([
            new StaffProvider().list({ filters: { clientId: clientId } }),
            new BeneficiaryProvider().list({ filters: { clientId: clientId } }),
            new ContractProvider().list({ filters: { clientId: clientId } }),
            new DocumentProvider().list({ clientId: clientId })
        ]);

        const stats = {
            activeStaff: staff.data.filter(s => s.status === 'ACTIVE').length,
            activeBeneficiaries: beneficiaries.data.filter(b => b.status === 'ACTIVE').length,
            activeContracts: contracts.data.filter(c => c.status === 'ACTIVE').length,
            totalDocuments: documents.data.length
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Error fetching client stats:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
} 