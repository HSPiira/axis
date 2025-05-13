import React, { useState, useEffect } from 'react';

interface Organization {
    id: string;
    name: string;
    status: string;
    industry?: {
        id: string;
        name: string;
        code?: string | null;
    } | null;
}

// Client-side API functions
export async function getOrganizations(status?: string): Promise<Organization[]> {
    const url = new URL('/api/organizations', window.location.origin);
    if (status) {
        url.searchParams.set('status', status);
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch organizations');
    }

    return response.json();
}

export async function getOrganization(id: string): Promise<Organization> {
    const response = await fetch(`/api/organizations/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch organization');
    }

    return response.json();
}

export async function createOrganization(data: {
    name: string;
    status: string;
    industryId?: string;
}): Promise<Organization> {
    const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to create organization');
    }

    return response.json();
}

export async function updateOrganization(
    id: string,
    data: {
        name?: string;
        status?: string;
        industryId?: string | null;
    }
): Promise<Organization> {
    const response = await fetch(`/api/organizations/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to update organization');
    }

    return response.json();
}

export async function deleteOrganization(id: string): Promise<void> {
    const response = await fetch(`/api/organizations/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('Failed to delete organization');
    }
}

// Example React component using these functions
export function OrganizationList(): React.ReactElement {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadOrganizations() {
            try {
                const data = await getOrganizations('ACTIVE');
                setOrganizations(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        }

        loadOrganizations();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Organizations</h1>
            <ul>
                {organizations.map((org) => (
                    <li key={org.id}>
                        {org.name} - {org.status}
                        {org.industry && (
                            <span> (Industry: {org.industry.name})</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

// Example of creating a new organization
export function CreateOrganizationForm(): React.ReactElement {
    const [name, setName] = useState('');
    const [status, setStatus] = useState('ACTIVE');
    const [industryId, setIndustryId] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            await createOrganization({
                name,
                status,
                industryId: industryId || undefined,
            });
            // Reset form or show success message
        } catch (err) {
            // Handle error
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>
                    Name:
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </label>
            </div>
            <div>
                <label>
                    Status:
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="PENDING">Pending</option>
                    </select>
                </label>
            </div>
            <div>
                <label>
                    Industry ID:
                    <input
                        type="text"
                        value={industryId}
                        onChange={(e) => setIndustryId(e.target.value)}
                    />
                </label>
            </div>
            <button type="submit">Create Organization</button>
        </form>
    );
} 