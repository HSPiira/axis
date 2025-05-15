import { NextRequest } from "next/server";
import { ContractProvider } from "@/lib/providers/contract-provider";
import { auth } from "@/lib/auth";

interface ServiceAssignment {
    id: string;
    status: string;
}

interface ContractWithAssignments {
    id: string;
    clientId: string;
    status: string;
    serviceAssignments?: ServiceAssignment[];
}

export async function POST(
    request: NextRequest,
    { params }: { params: { clientId: string; id: string } }
) {
    try {
        const session = await auth();
        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const contractProvider = new ContractProvider();
        const contract = await contractProvider.get(params.id) as ContractWithAssignments;

        if (!contract || contract.clientId !== params.clientId) {
            return Response.json({ error: "Contract not found" }, { status: 404 });
        }

        const { reason } = await request.json();
        if (!reason) {
            return Response.json({ error: "Termination reason is required" }, { status: 400 });
        }

        if (reason.length < 3) {
            return Response.json(
                { error: "Termination reason must be at least 3 characters long" },
                { status: 400 }
            );
        }

        if (contract.status === "TERMINATED") {
            return Response.json({ error: "Contract is already terminated" }, { status: 400 });
        }

        if (contract.serviceAssignments?.some((assignment: ServiceAssignment) => assignment.status === "ACTIVE")) {
            return Response.json(
                { error: "Cannot terminate contract with active service assignments" },
                { status: 400 }
            );
        }

        const terminatedContract = await contractProvider.terminate(params.id, reason);
        return Response.json(terminatedContract);
    } catch (error) {
        console.error("Error terminating contract:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
} 