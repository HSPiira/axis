import React from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';

const fetchProfile = async () => {
    const res = await fetch('/api/auth/profile');
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
};

const UserProfile: React.FC = () => {
    const { data: session } = useSession();

    const { data: profile } = useQuery({
        queryKey: ['profile'],
        queryFn: fetchProfile,
        enabled: !!session?.user?.id,
    });

    if (!session?.user) return null;

    // Only use session data as fallback if profile data is not available
    const displayImage = profile?.image || session.user.image;
    const displayName = profile?.fullName || session.user.name;

    return (
        <div className="flex items-center gap-2 px-2 py-2 md:justify-center md:px-0 md:py-2 lg:justify-start lg:px-4">
            {displayImage ? (
                <img
                    src={displayImage}
                    alt={displayName || ''}
                    className="w-8 h-8 rounded-full object-cover"
                />
            ) : (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    {displayName?.[0] || '?'}
                </div>
            )}
            <span className="font-medium text-gray-900 dark:text-white text-sm truncate md:hidden lg:flex">
                {displayName}
            </span>
        </div>
    );
};

export default UserProfile; 