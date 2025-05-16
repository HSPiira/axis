import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
            back: jest.fn(),
        };
    },
    usePathname() {
        return '';
    },
    useSearchParams() {
        return new URLSearchParams();
    },
}));

// Mock next-auth
jest.mock('next-auth', () => ({
    auth: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
}));

// Mock Headers, Request, and Response for Next.js
class MockHeaders {
    private headers: { [key: string]: string } = {};

    append(name: string, value: string): void {
        this.headers[name] = value;
    }

    delete(name: string): void {
        delete this.headers[name];
    }

    get(name: string): string | null {
        return this.headers[name] || null;
    }

    has(name: string): boolean {
        return name in this.headers;
    }

    set(name: string, value: string): void {
        this.headers[name] = value;
    }

    forEach(callback: (value: string, name: string) => void): void {
        Object.entries(this.headers).forEach(([name, value]) => callback(value, name));
    }
}

class MockRequest implements Partial<Request> {
    private _url: string;
    private _method: string;
    private _headers: Headers;
    private _body: any;

    constructor(input: string | URL, init?: RequestInit) {
        this._url = input.toString();
        this._method = init?.method || 'GET';
        this._headers = new Headers(init?.headers);
        this._body = init?.body;
    }

    get url(): string {
        return this._url;
    }

    get method(): string {
        return this._method;
    }

    get headers(): Headers {
        return this._headers;
    }

    get body(): any {
        return this._body;
    }

    json(): Promise<any> {
        return Promise.resolve(
            typeof this._body === 'string' ? JSON.parse(this._body) : this._body
        );
    }
}

class MockResponse implements Partial<Response> {
    private _body: any;
    private _init: ResponseInit;

    constructor(body?: BodyInit | null, init?: ResponseInit) {
        this._body = body;
        this._init = init || {};
    }

    get status(): number {
        return this._init.status || 200;
    }

    get headers(): Headers {
        return new Headers(this._init.headers);
    }

    json(): Promise<any> {
        return Promise.resolve(
            typeof this._body === 'string' ? JSON.parse(this._body) : this._body
        );
    }
}

// Mock URL and URLSearchParams
class MockURL {
    private _url: string;
    private _searchParams: URLSearchParams;

    constructor(url: string) {
        this._url = url;
        this._searchParams = new URLSearchParams(url.split('?')[1] || '');
    }

    get searchParams(): URLSearchParams {
        return this._searchParams;
    }
}

// Set up global mocks
global.Headers = MockHeaders as any;
global.Request = MockRequest as any;
global.Response = MockResponse as any;
global.URL = MockURL as any;

// Mock console.error to suppress React warnings
const originalError = console.error;
console.error = (...args: any[]) => {
    if (
        typeof args[0] === 'string' &&
        args[0].includes('Warning:') &&
        args[0].includes('React')
    ) {
        return;
    }
    originalError.call(console, ...args);
}; 