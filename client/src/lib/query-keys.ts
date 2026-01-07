export const QUERY_KEYS = {
    auth: {
        me: ['auth', 'me'] as const,
    },
    habits: {
        all: ['habits', 'all'] as const,
        detail: (id: string) => ['habits', 'detail', id] as const,
        performance: (id: string) => ['habits', 'performance', id] as const,
        history: (id: string, params?: any) => ['habits', 'history', id, params] as const,
    },
    performance: {
        summary: ['performance', 'summary'] as const,
    },
};
