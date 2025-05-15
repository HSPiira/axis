import { NextRequest } from "next/server";
import { ContractProvider } from "@/lib/providers/contract-provider";
import { auth } from "@/lib/auth";

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
        const contract = await contractProvider.get(params.id);

        if (!contract || contract.clientId !== params.clientId) {
            return Response.json({ error: "Contract not found" }, { status: 404 });
        }

        const { newEndDate } = await request.json();
        if (!newEndDate) {
            return Response.json({ error: "New end date is required" }, { status: 400 });
        }

        if (!contract.isRenewable) {
            return Response.json({ error: "Contract is not renewable" }, { status: 400 });
        }

        if (contract.status === "TERMINATED") {
            return Response.json({ error: "Cannot renew a terminated contract" }, { status: 400 });
        }

        const renewedContract = await contractProvider.renew(params.id, new Date(newEndDate));
        return Response.json(renewedContract);
    } catch (error) {
        console.error("Error renewing contract:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
} 