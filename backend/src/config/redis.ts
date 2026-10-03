const cache = new Map<string, { value: string; expiry: number }>();

export const cacheGet = async (key: string): Promise<string | null> => {
    const item = cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
        cache.delete(key);
        return null;
    }
    return item.value;
};

export const cacheSet = async (key: string, value: string, ttlSeconds = 3600): Promise<void> => {
    cache.set(key, {
        value,
        expiry: Date.now() + ttlSeconds * 1000,
    });
};

export const cacheDelete = async (key: string): Promise<void> => {
    cache.delete(key);
};

console.log('✅ In-memory cache initialized (Redis disabled for local dev)');

