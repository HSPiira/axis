import { LRUCache } from 'lru-cache';

interface RateLimitOptions {
    interval: number;
    uniqueTokenPerInterval: number;
}

interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

export function rateLimit(options: RateLimitOptions) {
    const tokenCache = new LRUCache({
        max: options.uniqueTokenPerInterval || 500,
        ttl: options.interval || 60000,
    });

    return {
        check: (limit: number, token: string): Promise<RateLimitResult> => {
            const tokenCount = (tokenCache.get(token) as number[]) || [0];
            const now = Date.now();
            const windowStart = now - options.interval;

            // Remove old requests
            while (tokenCount.length && tokenCount[0] < windowStart) {
                tokenCount.shift();
            }

            // Check if limit is exceeded
            if (tokenCount.length >= limit) {
                return Promise.reject(new Error('Rate limit exceeded'));
            }

            // Add current request
            tokenCount.push(now);
            tokenCache.set(token, tokenCount);

            return Promise.resolve({
                success: true,
                limit,
                remaining: limit - tokenCount.length,
                reset: windowStart + options.interval
            });
        }
    };
} 