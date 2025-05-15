import { NextRequest } from "next/server";
import { ContractProvider } from "@/lib/providers/contract-provider";
import { auth } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string; contractId: string } }
) {
    try {
        const session = await auth();
        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const contractProvider = new ContractProvider();
        const contract = await contractProvider.get(params.contractId);

        if (!contract || contract.clientId !== params.id) {
            return Response.json({ error: "Contract not found" }, { status: 404 });
        }

        return Response.json(contract);
    } catch (error) {
        console.error("Error fetching contract:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string; contractId: string } }
) {
    try {
        const session = await auth();
        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const contractProvider = new ContractProvider();
        const contract = await contractProvider.get(params.contractId);

        if (!contract || contract.clientId !== params.id) {
            return Response.json({ error: "Contract not found" }, { status: 404 });
        }

        const updateData = await request.json();
        const updatedContract = await contractProvider.update(params.contractId, updateData);

        return Response.json(updatedContract);
    } catch (error) {
        console.error("Error updating contract:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string; contractId: string } }
) {
    try {
        const session = await auth();
        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const contractProvider = new ContractProvider();
        const contract = await contractProvider.get(params.contractId);

        if (!contract || contract.clientId !== params.id) {
            return Response.json({ error: "Contract not found" }, { status: 404 });
        }

        const deletedContract = await contractProvider.delete(params.contractId);
        return Response.json(deletedContract);
    } catch (error) {
        console.error("Error deleting contract:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
} 