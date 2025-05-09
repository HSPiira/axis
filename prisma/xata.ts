import { XataApiClient } from '@xata.io/client';

export const getXataClient = () => {
    return new XataApiClient({
        apiKey: process.env.XATA_API_KEY,
    });
}; 