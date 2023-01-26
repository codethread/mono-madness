export type Key<T> = T extends readonly (infer U)[] ? U : never;

export type Deps<A extends string> = Partial<Record<A, string[]>>;
