import { createId } from '@paralleldrive/cuid2';
import permissions from './permissions.json';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function main() {
    const client = await pool.connect();
    try {
        for (const perm of permissions) {
            await client.query(
                'INSERT INTO "Permission" (id, name, description) VALUES ($1, $2, $3)',
                [createId(), perm.name, perm.description]
            );
        }
        console.log('Permissions seeded!');
    } finally {
        client.release();
    }
}

main().catch(console.error).finally(() => pool.end());
