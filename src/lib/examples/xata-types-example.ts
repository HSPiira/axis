import { XataClient } from '@/xata';
import type { OrganizationRecord } from '@/xata';
import type { Prisma } from '@/generated/prisma';

// Generic base types
interface BaseModel {
    id: string;
}

interface BaseCreateInput {
    [key: string]: any;
}

interface BaseUpdateInput {
    [key: string]: any;
}

// Generic database provider interface
interface BaseDatabaseProvider<T extends BaseModel, C extends BaseCreateInput, U extends BaseUpdateInput> {
    create(data: C): Promise<T>;
    get(id: string): Promise<T | null>;
    update(id: string, data: U): Promise<T>;
    delete(id: string): Promise<void>;
    list(filter?: Partial<T>): Promise<T[]>;
}

// Generic Xata implementation
class XataBaseProvider<
    T extends BaseModel,
    C extends BaseCreateInput,
    U extends BaseUpdateInput,
    R extends { id: string }
> implements BaseDatabaseProvider<T, C, U> {
    protected client: XataClient;
    protected table: string;

    constructor(client: XataClient, table: string) {
        this.client = client;
        this.table = table;
    }

    async create(data: C): Promise<T> {
        const record = await (this.client.db as any)[this.table].create(data);
        return this.transform(record);
    }

    async get(id: string): Promise<T | null> {
        const record = await (this.client.db as any)[this.table]
            .filter({ id })
            .getFirst();

        if (!record) return null;
        return this.transform(record);
    }

    async update(id: string, data: U): Promise<T> {
        const record = await (this.client.db as any)[this.table].update(id, data);
        return this.transform(record);
    }

    async delete(id: string): Promise<void> {
        await (this.client.db as any)[this.table].delete(id);
    }

    async list(filter?: Partial<T>): Promise<T[]> {
        const records = await (this.client.db as any)[this.table]
            .filter(filter || {})
            .getMany();

        return records.map((record: R) => this.transform(record));
    }

    protected transform(record: R): T {
        return record as unknown as T;
    }
}

// Specific model types
interface Organization extends BaseModel {
    name: string;
    status: string;
    industryId?: string | null;
    industry?: {
        id: string;
        name: string;
        code?: string | null;
    } | null;
}

interface OrganizationCreateInput extends BaseCreateInput {
    name: string;
    status: string;
    industryId?: string;
}

interface OrganizationUpdateInput extends BaseUpdateInput {
    name?: string;
    status?: string;
    industryId?: string | null;
}

// Specific model implementation
export class OrganizationProvider extends XataBaseProvider<Organization, OrganizationCreateInput, OrganizationUpdateInput, OrganizationRecord> {
    constructor(client: XataClient) {
        super(client, 'Organization');
    }

    protected transform(record: OrganizationRecord): Organization {
        return record as unknown as Organization;
    }

    protected async enrichWithIndustry(record: OrganizationRecord): Promise<Organization> {
        if (!record.industryId) return record as Organization;

        const industry = await this.client.db.Industry
            .filter('id', record.industryId)
            .select(['id', 'name', 'code'])
            .getFirst();

        return {
            ...record,
            industry: industry || null
        } as Organization;
    }

    // Override methods to include industry data
    async get(id: string): Promise<Organization | null> {
        const record = await super.get(id);
        if (!record) return null;
        return this.enrichWithIndustry(record as OrganizationRecord);
    }

    async list(filter?: Partial<Organization>): Promise<Organization[]> {
        const records = await super.list(filter);
        return Promise.all(records.map(record => this.enrichWithIndustry(record as OrganizationRecord)));
    }

    // Add organization-specific methods
    async getByStatus(status: string): Promise<Organization[]> {
        return this.list({ status } as Partial<Organization>);
    }
}

// Example usage
async function genericProviderExample() {
    const client = new XataClient();

    // Create providers for different models
    const orgProvider = new OrganizationProvider(client);

    // Use the providers
    const newOrg = await orgProvider.create({
        name: 'New Organization',
        status: 'ACTIVE'
    });

    const org = await orgProvider.get(newOrg.id);
    const activeOrgs = await orgProvider.getByStatus('ACTIVE');

    return { newOrg, org, activeOrgs };
}

// Initialize the Xata client
const xata = new XataClient();

// Example 1: Basic CRUD Operations
async function basicCrudExample() {
    // Create
    const newOrg = await xata.db.Organization.create({
        name: 'New Organization',
        status: 'ACTIVE'
    });

    // Read
    const org = await xata.db.Organization.read(newOrg.id);

    // Update
    const updatedOrg = await xata.db.Organization.update(newOrg.id, {
        name: 'Updated Organization'
    });

    // Delete
    await xata.db.Organization.delete(newOrg.id);

    return { newOrg, org, updatedOrg };
}

// Example 2: Filtering and Pagination
async function filteringAndPaginationExample() {
    // Filter
    const activeOrgs = await xata.db.Organization
        .filter({ status: 'ACTIVE' })
        .getMany();

    // Pagination
    const page = await xata.db.Organization
        .select(['id', 'name', 'status'])
        .getPaginated({
            pagination: {
                size: 10,
                offset: 0
            }
        });

    return { activeOrgs, page };
}

// Example 3: Including Related Records
async function includeRelatedExample(orgId: string) {
    const org = await xata.db.Organization
        .filter({ id: orgId })
        .select(['id', 'name', 'industryId'])
        .getFirst();

    if (org?.industryId) {
        const industry = await xata.db.Industry
            .filter('id', org.industryId)
            .select(['id', 'name', 'code'])
            .getFirst();
        return { ...org, industry };
    }

    return org;
}

// Example 4: Search
async function searchExample(query: string) {
    const results = await xata.db.Organization.search(query, {
        fuzziness: 2,
        prefix: 'phrase'
    });

    return results;
}

// Example 5: Type-Safe Updates
async function typeSafeUpdateExample(orgId: string) {
    // TypeScript will ensure we only update valid fields
    const update: Partial<OrganizationRecord> = {
        name: 'Updated Name',
        status: 'ACTIVE'
    };

    const updatedOrg = await xata.db.Organization.update(orgId, update);
    return updatedOrg;
}

// Example 6: Using Prisma Types with Xata
async function prismaTypesExample() {
    // Define a type that matches both Prisma and Xata schemas
    type OrganizationWithIndustry = {
        id: string;
        name: string;
        status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
        industry?: {
            id: string;
            name: string;
            code?: string | null;
        } | null;
    };

    // Create a new organization using Prisma types
    const createInput: Prisma.OrganizationCreateInput = {
        name: 'New Organization',
        status: 'ACTIVE',
        industry: {
            connect: {
                id: 'existing-industry-id'
            }
        }
    };

    // Convert Prisma input to Xata format
    const xataCreateInput = {
        name: createInput.name,
        status: createInput.status,
        industryId: createInput.industry?.connect?.id
    };

    // Create in Xata
    const newOrg = await xata.db.Organization.create(xataCreateInput);

    // Fetch with related data
    const org = await xata.db.Organization
        .filter({ id: newOrg.id })
        .select(['id', 'name', 'status', 'industryId'])
        .getFirst();

    if (org?.industryId) {
        const industry = await xata.db.Industry
            .filter('id', org.industryId)
            .select(['id', 'name', 'code'])
            .getFirst();

        // Return in a format compatible with both Prisma and Xata types
        return {
            ...org,
            industry
        } as OrganizationWithIndustry;
    }

    return org as OrganizationWithIndustry;
}

export {
    basicCrudExample,
    filteringAndPaginationExample,
    includeRelatedExample,
    searchExample,
    typeSafeUpdateExample,
    prismaTypesExample,
    genericProviderExample
}; 