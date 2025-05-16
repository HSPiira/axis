// Mock Next.js server components
vi.mock('next/headers', () => ({
  headers: () => new Headers(),
  cookies: () => new Map(),
}))

// Mock Response.json
const originalResponse = global.Response
global.Response = class extends originalResponse {
  static json(data: any, init?: ResponseInit) {
    return new originalResponse(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })
  }
} as any

// Mock Next.js server actions
vi.mock('next/server', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
})) 