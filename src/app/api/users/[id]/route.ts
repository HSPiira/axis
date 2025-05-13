import { NextRequest, NextResponse } from "next/server";
import { withPermission } from "@/middleware/check-permission";
import { PERMISSIONS } from "@/lib/constants/roles";
import { UserProvider } from "@/lib/providers/user-provider";
import { ApiResponse, ApiErrorResponse } from '@/lib/types/user';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/user-response';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const userProvider = new UserProvider();
        const user = await userProvider.get(params.id);

        if (!user) {
            return NextResponse.json(
                createErrorResponse("User not found", "NOT_FOUND"),
                { status: 404 }
            );
        }

        return NextResponse.json(createSuccessResponse(user));
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            createErrorResponse("Failed to fetch user", "INTERNAL_ERROR"),
            { status: 500 }
        );
    }
}

export const PATCH = withPermission(PERMISSIONS.USER_UPDATE)(async (
    request: Request,
    { params }: { params: { id: string } }
) => {
    try {
        const data = await request.json();
        const userProvider = new UserProvider();

        // Validate required fields
        if (!data.email && !data.profile?.upsert?.create?.fullName) {
            return NextResponse.json(
                createErrorResponse("At least one field (email or fullName) is required", "VALIDATION_ERROR"),
                { status: 400 }
            );
        }

        // Validate email format if provided
        if (data.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                return NextResponse.json(
                    createErrorResponse("Invalid email format", "VALIDATION_ERROR"),
                    { status: 400 }
                );
            }
        }

        const user = await userProvider.update(params.id, {
            email: data.email,
            profile: data.profile
        });

        return NextResponse.json(createSuccessResponse(user));
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            createErrorResponse("Failed to update user", "INTERNAL_ERROR"),
            { status: 500 }
        );
    }
}); 