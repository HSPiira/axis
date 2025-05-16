import { NextResponse } from 'next/server';
import { createHash } from 'crypto';

export interface CacheOptions {
    maxAge?: number;
    staleWhileRevalidate?: number;
    isPrivate?: boolean;
}

export class CacheControl {
    static getHeaders(options: CacheOptions = {}) {
        const {
            maxAge = 10,
            staleWhileRevalidate = 59,
            isPrivate = false,
        } = options;

        return {
            'Cache-Control': [
                isPrivate ? 'private' : 'public',
                `s-maxage=${maxAge}`,
                `stale-while-revalidate=${staleWhileRevalidate}`,
            ].join(', '),
        };
    }

    static generateETag(data: any): string {
        const content = typeof data === 'string' ? data : JSON.stringify(data);
        return createHash('sha256').update(content).digest('base64');
    }

    static withCache(response: NextResponse, data: any, options?: CacheOptions): NextResponse {
        const etag = this.generateETag(data);
        const headers = this.getHeaders(options);

        // Clone the response to add headers
        const newResponse = NextResponse.json(data, {
            status: response.status,
            headers: {
                ...Object.fromEntries(response.headers),
                ...headers,
                'ETag': `"${etag}"`,
            },
        });

        return newResponse;
    }
} 