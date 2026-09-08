const values = new Map<string, unknown>()

export const storage = {
  async getItem<T>(key: string): Promise<T | null> {
    return (values.get(key) as T) ?? null
  },
  async setItem(key: string, value: unknown) {
    values.set(key, structuredClone(value))
  },
  defineItem<T>(key: string, options: { fallback: T }) {
    return {
      async getValue(): Promise<T> {
        return structuredClone((values.get(key) ?? options.fallback) as T)
      },
      async setValue(value: T) {
        values.set(key, structuredClone(value))
      },
      async removeValue() {
        values.delete(key)
      },
      watch() {
        return () => {}
      },
    }
  },
}

export const browser = {
  storage: {
    local: {
      async get() {
        return {}
      },
    },
  },
}
