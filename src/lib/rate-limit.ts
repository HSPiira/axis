import { Redis } from "@upstash/redis"
import { Ratelimit } from "@upstash/ratelimit"

// Create a new ratelimiter that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
})

export const rateLimit = {
    check: async (identifier: string = "anonymous", ip: string = "127.0.0.1") => {
        const { success } = await ratelimit.limit(`${identifier}:${ip}`)
        return { success }
    },
} 