import { useState, useEffect, useCallback } from "react"

/**
 * Returns a debounced version of the value. The debounced value updates only
 * after `delayMs` has passed without the value changing.
 *
 * @param value - The value to debounce
 * @param delayMs - Debounce delay in milliseconds
 * @returns The debounced value
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debouncedValue
}

/**
 * Returns a stable debounced callback. The callback is invoked only after
 * `delayMs` has passed since the last invocation.
 *
 * @param callback - The callback to debounce
 * @param delayMs - Debounce delay in milliseconds
 * @returns A debounced version of the callback
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delayMs: number
): T {
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null)

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutId) clearTimeout(timeoutId)
      const id = setTimeout(() => {
        callback(...args)
        setTimeoutId(null)
      }, delayMs)
      setTimeoutId(id)
    }) as T,
    [callback, delayMs]
  )

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [timeoutId])

  return debouncedCallback
}
