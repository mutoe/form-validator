export function isNullOrUndefined (value: unknown): value is null | undefined {
  return value === null || value === undefined
}

export const injectVariables = (str: string, keys: Record<string, any>): string => {
  return str.replaceAll(/\{(.+?)}/g, (_, key) => {
    const value = keys[key]
    if (isNullOrUndefined(value)) return `{${key}}`
    return value
  })
}

export function assert (condition: boolean, message?: string): asserts condition {
  if (!condition) throw new Error(message ?? 'Assertion failed')
}
