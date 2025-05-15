import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Redis client
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export interface RateLimitConfig {
    maxRequests: number    // Maximum number of requests
    windowMs: number       // Time window in milliseconds
}

function getIP(request: NextRequest) {
    const xff = request.headers.get('x-forwarded-for')
    return xff ? xff.split(',')[0] : '127.0.0.1'
}

export async function rateLimit(
    request: NextRequest,
    config: RateLimitConfig = {
        maxRequests: 10,   // 10 requests
        windowMs: 60000,   // per minute
    }
) {
    const ip = getIP(request)
    const key = `rate-limit:${ip}`

    const window = Math.floor(Date.now() / config.windowMs)
    const keyWithWindow = `${key}:${window}`

    try {
        const result = await redis.incr(keyWithWindow)

        // Set expiry for the key
        if (result === 1) {
            await redis.expire(keyWithWindow, Math.ceil(config.windowMs / 1000))
        }

        // Set rate limit headers
        const remaining = Math.max(0, config.maxRequests - result)
        const headers = new Headers({
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': (window * config.windowMs + config.windowMs).toString(),
        })

        // If rate limit exceeded
        if (result > config.maxRequests) {
            return new NextResponse('Too Many Requests', {
                status: 429,
                statusText: 'Too Many Requests',
                headers,
            })
        }

        return null
    } catch (error) {
        console.error('Rate limiting error:', error)
        // Fail open - allow the request if Redis is down
        return null
    }
} 