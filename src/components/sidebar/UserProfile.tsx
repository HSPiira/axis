import React from 'react';

interface UserProfileProps {
    user: {
        avatar: string;
        name: string;
    };
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
    return (
        <>
            <div className="flex items-center gap-2 px-2 py-2 border-b border-gray-100 md:justify-center md:px-0 md:py-2 lg:justify-start lg:px-4">
                <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-medium text-gray-900 text-sm truncate md:hidden lg:flex">{user.name}</span>
            </div>
            <div className="border-b border-gray-200 mx-2" />
        </>
    );
};

export default UserProfile; 