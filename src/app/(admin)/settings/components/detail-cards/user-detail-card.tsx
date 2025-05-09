import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mail, Shield, Info, Calendar, User as UserIcon, FileText, MessageSquare, StickyNote, BookOpen, Clock, Trash2, KeyRound, CheckCircle2, X } from 'lucide-react';

interface User {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    createdAt: string;
    updatedAt: string;
    userRoles: {
        role: {
            name: string;
        };
    }[];
}

const UserDetailsCard = ({ user, onClose }: { user: User; onClose: () => void }) => {
    const role = user.userRoles[0]?.role.name || 'No Role';
    const roleDesc = role === 'Administrator'
        ? 'Manages users, system settings, roles, and has full access to all data and configuration features.'
        : 'No role description.';
    return (
        <div className="w-[340px] bg-white dark:bg-muted rounded-xl shadow-sm p-4 ml-6 flex flex-col border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback className="text-lg">{user.name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="font-semibold flex items-center gap-1" style={{ lineHeight: '1.2' }}>
                        <span className={`${user.name && user.name.length > 22 ? 'text-sm' : 'text-base'} whitespace-nowrap max-w-[180px]`}>
                            {user.name || 'Unnamed User'}
                        </span>
                        <CheckCircle2 className="text-green-500 h-4 w-4 flex-shrink-0" />
                    </div>
                    {user.email && <div className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{user.email}</div>}
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="h-3 w-3" />Last seen on {new Date(user.updatedAt).toLocaleDateString()}</div>
                </div>
                <button onClick={onClose} className="ml-2 p-1 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="border-t my-2" />
            <div className="mb-2">
                <div className="font-medium text-[12px] text-indigo-600 flex items-center gap-1"><Shield className="h-4 w-4" />{role}</div>
                <div className="text-xs text-muted-foreground mt-0.5 ml-5">{roleDesc}</div>
            </div>
            <div className="flex items-center gap-2 text-xs mb-2">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">Id:</span>
                <span className="font-mono text-xs">{user.id}</span>
            </div>
            <div className="flex items-center gap-2 text-xs mb-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">Created:</span>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs mb-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">Updated:</span>
                <span>{new Date(user.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="border-t my-2" />
            <div className="font-semibold text-xs mb-1">Activity</div>
            <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                <div className="flex items-center gap-1"><FileText className="h-3 w-3 text-blue-400" />Documents: 0</div>
                <div className="flex items-center gap-1"><MessageSquare className="h-3 w-3 text-blue-400" />Messages: 0</div>
                <div className="flex items-center gap-1"><StickyNote className="h-3 w-3 text-yellow-400" />Notes: 0</div>
                <div className="flex items-center gap-1"><BookOpen className="h-3 w-3 text-green-500" />Resources: 0</div>
                <div className="flex items-center gap-1"><Clock className="h-3 w-3 text-gray-400" />Sessions: 0</div>
            </div>
            <div className="flex gap-2 mt-auto pt-2 border-t">
                <Button variant="ghost" size="icon"><KeyRound className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Mail className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><MessageSquare className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><FileText className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><StickyNote className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><BookOpen className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>
            </div>
        </div>
    );
};

export default UserDetailsCard; 