import { NextRequest } from "next/server";
import { ContractProvider } from "@/lib/providers/contract-provider";
import { auth } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: { clientId: string } }
) {
    try {
        const session = await auth();
        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const contractProvider = new ContractProvider();
        const contracts = await contractProvider.findByClient(params.clientId);

        return Response.json(contracts);
    } catch (error) {
        console.error("Error fetching contracts:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { clientId: string } }
) {
    try {
        const session = await auth();
        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const contractProvider = new ContractProvider();
        const contractData = await request.json();
        const newContract = await contractProvider.create({
            ...contractData,
            clientId: params.clientId
        });

        return Response.json(newContract, { status: 201 });
    } catch (error) {
        console.error("Error creating contract:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
} 