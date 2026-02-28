/**
 * Safe wrapper around localStorage and sessionStorage to prevent crashes
 * in strict browsers (like Brave with Shields) where storage access is denied.
 * Falls back to an in-memory Map to keep the app functional without crashing.
 */

class SafeStorage {
    private fallbackMemory = new Map<string, string>();
    private isSession: boolean;

    constructor(isSession = false) {
        this.isSession = isSession;
    }

    private get storage(): Storage | null {
        try {
            return this.isSession ? window.sessionStorage : window.localStorage;
        } catch {
            return null;
        }
    }

    getItem(key: string): string | null {
        try {
            const store = this.storage;
            if (store) return store.getItem(key);
        } catch {
            return this.fallbackMemory.get(key) || null;
        }
        return this.fallbackMemory.get(key) || null;
    }

    setItem(key: string, value: string): void {
        try {
            const store = this.storage;
            if (store) {
                store.setItem(key, value);
                return;
            }
        } catch {
            // Ignore DOMException
        }
        this.fallbackMemory.set(key, value);
    }

    removeItem(key: string): void {
        try {
            const store = this.storage;
            if (store) {
                store.removeItem(key);
                return;
            }
        } catch {
            // Ignore DOMException
        }
        this.fallbackMemory.delete(key);
    }

    clear(): void {
        try {
            const store = this.storage;
            if (store) {
                store.clear();
                return;
            }
        } catch {
            // Ignore DOMException
        }
        this.fallbackMemory.clear();
    }
}

let safeLocal: SafeStorage | undefined;
let safeSession: SafeStorage | undefined;

export const safeLocalStorage = {
    getItem: (key: string) => {
        if (typeof window === 'undefined') return null;
        if (!safeLocal) safeLocal = new SafeStorage(false);
        return safeLocal.getItem(key);
    },
    setItem: (key: string, value: string) => {
        if (typeof window === 'undefined') return;
        if (!safeLocal) safeLocal = new SafeStorage(false);
        safeLocal.setItem(key, value);
    },
    removeItem: (key: string) => {
        if (typeof window === 'undefined') return;
        if (!safeLocal) safeLocal = new SafeStorage(false);
        safeLocal.removeItem(key);
    },
    clear: () => {
        if (typeof window === 'undefined') return;
        if (!safeLocal) safeLocal = new SafeStorage(false);
        safeLocal.clear();
    }
};

export const safeSessionStorage = {
    getItem: (key: string) => {
        if (typeof window === 'undefined') return null;
        if (!safeSession) safeSession = new SafeStorage(true);
        return safeSession.getItem(key);
    },
    setItem: (key: string, value: string) => {
        if (typeof window === 'undefined') return;
        if (!safeSession) safeSession = new SafeStorage(true);
        safeSession.setItem(key, value);
    },
    removeItem: (key: string) => {
        if (typeof window === 'undefined') return;
        if (!safeSession) safeSession = new SafeStorage(true);
        safeSession.removeItem(key);
    },
    clear: () => {
        if (typeof window === 'undefined') return;
        if (!safeSession) safeSession = new SafeStorage(true);
        safeSession.clear();
    }
};
