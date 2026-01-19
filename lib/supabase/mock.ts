import { Session, User } from "@supabase/supabase-js";

// Global storage to persist across revalidations in dev mode
const globalForMock = globalThis as unknown as {
    mockDb: Record<string, any[]>;
    mockUsers: any[];
};

if (!globalForMock.mockDb) {
    globalForMock.mockDb = {
        folders: [],
        cards: [],
        progress: [],
    };
    globalForMock.mockUsers = [];
}

const db = globalForMock.mockDb;
const users = globalForMock.mockUsers;

// Helper to simulate DB delay
const delay = () => new Promise((resolve) => setTimeout(resolve, 300));

export function createMockClient() {
    return {
        auth: {
            getUser: async () => {
                // Return a fake logged-in user for testing if one exists, else null
                // For simplicity in this "Test Mode", we function as if logged in as "developer"
                // provided we have 'signed in' at least once logic-wise, 
                // OR we just return a static user to unblock the middleware.
                // Let's implement a simple fake session.
                return { data: { user: { id: "dev-user-id", email: "dev@local.test" } }, error: null };
            },
            onAuthStateChange: (cb: any) => {
                // Trigger immediately as logged in
                cb("SIGNED_IN", { user: { id: "dev-user-id", email: "dev@local.test" } });
                return { data: { subscription: { unsubscribe: () => { } } } };
            },
            signInWithPassword: async ({ email }: any) => {
                await delay();
                return { data: { user: { id: "dev-user-id", email } }, error: null };
            },
            signUp: async ({ email }: any) => {
                await delay();
                return { data: { user: { id: "dev-user-id", email } }, error: null };
            },
            signOut: async () => {
                // In a real mock we'd clear some state, but for "Test Mode" we basically always allow access
                return { error: null };
            },
            signInWithOAuth: async () => ({ error: null }),
        },
        from: (table: string) => {
            const queryState = {
                table,
                filters: [] as any[],
                isInsert: false,
                isUpdate: false,
                isDelete: false,
                data: null as any,
                single: false,
                order: null as any,
            };

            const chain = {
                select: (cols: string) => chain,
                insert: (payload: any) => {
                    queryState.isInsert = true;
                    queryState.data = payload;
                    return chain;
                },
                upsert: (payload: any, opts: any) => {
                    queryState.isUpdate = true; // treat as insert/update
                    queryState.data = payload;
                    return chain;
                },
                delete: () => {
                    queryState.isDelete = true;
                    return chain;
                },
                eq: (col: string, val: any) => {
                    queryState.filters.push({ col, op: "eq", val });
                    return chain;
                },
                in: (col: string, val: any[]) => {
                    queryState.filters.push({ col, op: "in", val });
                    return chain;
                },
                order: (col: string, opts: any) => {
                    queryState.order = { col, opts };
                    return chain;
                },
                single: () => {
                    queryState.single = true;
                    return chain;
                },
                then: async (resolve: any, reject: any) => {
                    await delay();
                    let rows = db[table] || [];

                    // Apply filters (for Select/Update/Delete targeting)
                    let result = rows.filter(row => {
                        return queryState.filters.every(f => {
                            if (f.op === "eq") return row[f.col] === f.val;
                            if (f.op === "in") return f.val.includes(row[f.col]);
                            return true;
                        });
                    });

                    if (queryState.isInsert) {
                        const newItem = {
                            id: `${table.substring(0, 1)}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            created_at: new Date().toISOString(),
                            ...queryState.data
                        };
                        db[table].push(newItem);
                        // Return inserted item
                        resolve({ data: queryState.single ? newItem : [newItem], error: null });
                        return;
                    }

                    if (queryState.isDelete) {
                        // Remove items matching filter
                        // We need to mutate the original array
                        const idsToDelete = new Set(result.map(r => r.id));
                        db[table] = db[table].filter(r => !idsToDelete.has(r.id));
                        resolve({ error: null });
                        return;
                    }

                    if (queryState.isUpdate) { // Upsert roughly
                        const payload = queryState.data;
                        // Naive upsert: check ID or fallback
                        // For this app, only Progress uses Upsert on card_id + owner_id
                        if (table === 'progress') {
                            let existing = rows.find(r => r.card_id === payload.card_id && r.owner_id === payload.owner_id);
                            if (existing) {
                                Object.assign(existing, payload);
                                resolve({ data: existing, error: null });
                            } else {
                                const newItem = { id: `p_${Date.now()}`, ...payload };
                                db[table].push(newItem);
                                resolve({ data: newItem, error: null });
                            }
                            return;
                        }
                    }

                    // Select
                    // Sort
                    if (queryState.order) {
                        const { col, opts } = queryState.order;
                        result.sort((a, b) => {
                            if (a[col] < b[col]) return opts.ascending ? -1 : 1;
                            if (a[col] > b[col]) return opts.ascending ? 1 : -1;
                            return 0;
                        });
                    }

                    const responseData = queryState.single ? (result[0] || null) : result;
                    resolve({ data: responseData, error: null });
                }
            };
            return chain;
        }
    };
}
