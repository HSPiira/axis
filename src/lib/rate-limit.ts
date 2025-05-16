import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

class RateLimiter {
    private store: Map<string, { count: number; reset: number }>;
    private redis: Redis | null = null;

    constructor() {
        this.store = new Map();
        
        // Initialize Redis if UPSTASH_REDIS_URL is available
        if (process.env.UPSTASH_REDIS_URL) {
            this.redis = new Redis({
                url: process.env.UPSTASH_REDIS_URL,
                token: process.env.UPSTASH_REDIS_TOKEN || '',
            });
        }
    }

    private getKey(request: NextRequest, prefix: string): string {
        // Get IP from various possible headers or direct connection
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            '127.0.0.1';
            
        return `${prefix}:${ip}`;
    }

    async check(request: NextRequest, limit: number, window: string): Promise<RateLimitResult> {
        const windowMs = this.parseWindow(window);
        const key = this.getKey(request, `ratelimit:${limit}:${window}`);

        if (this.redis) {
            return this.checkRedis(key, limit, windowMs);
        }

        return this.checkMemory(key, limit, windowMs);
    }

    private async checkRedis(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
        const now = Date.now();
        const reset = Math.floor(now / windowMs) * windowMs + windowMs;

        if (!this.redis) {
            throw new Error('Redis not initialized');
        }

        const count = await this.redis.incr(key);
        if (count === 1) {
            await this.redis.pexpire(key, windowMs);
        }

        const ttl = await this.redis.pttl(key);
        
        return {
            success: count <= limit,
            limit,
            remaining: Math.max(0, limit - count),
            reset: Math.floor((now + ttl) / 1000),
        };
    }

    private checkMemory(key: string, limit: number, windowMs: number): RateLimitResult {
        const now = Date.now();
        const reset = Math.floor(now / windowMs) * windowMs + windowMs;

        const current = this.store.get(key);
        if (!current || current.reset <= now) {
            this.store.set(key, { count: 1, reset });
            return {
                success: true,
                limit,
                remaining: limit - 1,
                reset: Math.floor(reset / 1000),
            };
        }

        const count = current.count + 1;
        this.store.set(key, { count, reset });

        return {
            success: count <= limit,
            limit,
            remaining: Math.max(0, limit - count),
            reset: Math.floor(reset / 1000),
        };
    }

    private parseWindow(window: string): number {
        const match = window.match(/^(\d+)(ms|s|m|h|d)$/);
        if (!match) {
            throw new Error('Invalid window format. Use number + unit (ms|s|m|h|d)');
        }

        const [, value, unit] = match;
        const multipliers: Record<string, number> = {
            ms: 1,
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
        };

        return parseInt(value) * multipliers[unit];
    }
}

export const rateLimit = new RateLimiter(); 