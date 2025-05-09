import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import type { PermissionType } from "@/lib/constants/roles";

export function usePermission(permission: PermissionType) {
    const { data: session } = useSession();
    const [hasPermission, setHasPermission] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function checkPermission() {
            try {
                const response = await fetch(`/api/check-permission?permission=${permission}`);
                const data = await response.json();
                setHasPermission(data.hasPermission);
            } catch (error) {
                console.error('Error checking permission:', error);
                setHasPermission(false);
            } finally {
                setIsLoading(false);
            }
        }

        if (session) {
            checkPermission();
        } else {
            setHasPermission(false);
            setIsLoading(false);
        }
    }, [session, permission]);

    return { hasPermission, isLoading };
} 