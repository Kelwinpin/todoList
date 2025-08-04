import { useState, useCallback } from 'react'

interface UseLoadingReturn {
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
  toggleLoading: () => void
  withLoading: <T>(asyncFn: () => Promise<T>) => Promise<T>
}

export function useLoading(initialState: boolean = false): UseLoadingReturn {
  const [isLoading, setIsLoading] = useState(initialState)

  const startLoading = useCallback(() => {
    setIsLoading(true)
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  const toggleLoading = useCallback(() => {
    setIsLoading(prev => !prev)
  }, [])

  const withLoading = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T> => {
    try {
      setIsLoading(true)
      const result = await asyncFn()
      return result
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    withLoading
  }
}

interface UseMultipleLoadingReturn {
  loadingStates: Record<string, boolean>
  isAnyLoading: boolean
  isAllLoading: boolean
  startLoading: (key: string) => void
  stopLoading: (key: string) => void
  toggleLoading: (key: string) => void
  withLoading: <T>(key: string, asyncFn: () => Promise<T>) => Promise<T>
  resetAll: () => void
}

export function useMultipleLoading(keys: string[] = []): UseMultipleLoadingReturn {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    keys.reduce((acc, key) => ({ ...acc, [key]: false }), {})
  )

  const isAnyLoading = Object.values(loadingStates).some(Boolean)
  const isAllLoading = Object.values(loadingStates).every(Boolean)

  const startLoading = useCallback((key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }))
  }, [])

  const stopLoading = useCallback((key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: false }))
  }, [])

  const toggleLoading = useCallback((key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const withLoading = useCallback(async <T>(key: string, asyncFn: () => Promise<T>): Promise<T> => {
    try {
      setLoadingStates(prev => ({ ...prev, [key]: true }))
      const result = await asyncFn()
      return result
    } finally {
      setLoadingStates(prev => ({ ...prev, [key]: false }))
    }
  }, [])

  const resetAll = useCallback(() => {
    setLoadingStates(prev => 
      Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {})
    )
  }, [])

  return {
    loadingStates,
    isAnyLoading,
    isAllLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    withLoading,
    resetAll
  }
}

interface UseAsyncOperationOptions {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  showToast?: boolean
}

export function useAsyncOperation() {
  const { isLoading, withLoading } = useLoading()

  const execute = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options: UseAsyncOperationOptions = {}
  ): Promise<T | null> => {
    try {
      const result = await withLoading(asyncFn)
      options.onSuccess?.(result)
      return result
    } catch (error) {
      const err = error as Error
      options.onError?.(err)
      console.error('Async operation failed:', err)
      return null
    }
  }, [withLoading])

  return {
    isLoading,
    execute
  }
}