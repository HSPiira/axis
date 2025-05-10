import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

interface RateLimitOptions {
    windowMs?: number;
    max?: number;
}

export function rateLimit(options: RateLimitOptions = { windowMs: 60 * 1000, max: 100 }) {
    return {
        async check(max?: number, key?: string): Promise<RateLimitResult> {
            // Skip rate limiting in test environment
            if (process.env.NODE_ENV === 'test') {
                return {
                    success: true,
                    limit: max || options.max || 100,
                    remaining: max || options.max || 100,
                    reset: 0,
                };
            }

            const limit = max || options.max || 100;
            const windowMs = options.windowMs || 60 * 1000;

            try {
                const now = Date.now();
                const windowStart = now - windowMs;
                const identifier = key || 'default';
                const redisKey = `ratelimit:${identifier}`;

                // Get current count and reset time
                const [count, resetTime] = await Promise.all([
                    redis.zcount(redisKey, windowStart, '+inf'),
                    redis.ttl(redisKey),
                ]);

                // Clean up old entries
                await redis.zremrangebyscore(redisKey, 0, windowStart);

                // Add current request
                await redis.zadd(redisKey, { score: now, member: now.toString() });
                await redis.expire(redisKey, Math.ceil(windowMs / 1000));

                const remaining = Math.max(0, limit - count);

                return {
                    success: count < limit,
                    limit,
                    remaining,
                    reset: resetTime,
                };
            } catch (error) {
                console.error('Rate limit error:', error);
                // Fail open - allow request if rate limiting fails
                return {
                    success: true,
                    limit,
                    remaining: limit,
                    reset: 0,
                };
            }
        },
    };
} 