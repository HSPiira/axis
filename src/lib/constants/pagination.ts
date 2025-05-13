export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
export const MIN_PAGE_SIZE = 1;

export const DEFAULT_PAGE = 1;
export const MIN_PAGE = 1;

export function getValidatedPaginationParams(page?: string | null, limit?: string | null) {
    const parsedPage = page ? parseInt(page) : DEFAULT_PAGE;
    const parsedLimit = limit ? parseInt(limit) : DEFAULT_PAGE_SIZE;

    return {
        page: Math.max(MIN_PAGE, parsedPage),
        limit: Math.min(MAX_PAGE_SIZE, Math.max(MIN_PAGE_SIZE, parsedLimit))
    };
} 