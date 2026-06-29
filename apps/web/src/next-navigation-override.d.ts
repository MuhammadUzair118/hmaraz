declare module 'next/navigation' {
  export function useRouter(): {
    push: (url: string) => void
    replace: (url: string) => void
    prefetch: (url: string) => void
    back: () => void
    forward: () => void
    refresh: () => void
  }
  export function usePathname(): string
  export function useSearchParams(): {
    get: (key: string) => string | null
    getAll: (key: string) => string[]
    has: (key: string) => boolean
    forEach: (callback: (value: string, key: string) => void) => void
    entries: () => IterableIterator<[string, string]>
    keys: () => IterableIterator<string>
    values: () => IterableIterator<string>
    toString: () => string
  }
  export function useParams(): Record<string, string | string[]>
}
