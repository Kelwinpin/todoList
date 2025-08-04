import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeMap[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  className?: string
  loadingText?: string
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  className,
  loadingText = "Carregando..."
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-md">
          <div className="flex flex-col items-center space-y-3">
            <LoadingSpinner size="lg" className="text-white" />
            <span className="text-white text-sm font-medium">{loadingText}</span>
          </div>
        </div>
      )}
    </div>
  )
}

interface LoadingDotsProps {
  className?: string
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div className={cn("flex space-x-1", className)}>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  )
}

interface LoadingPulseProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingPulse({ className, size = "md" }: LoadingPulseProps) {
  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  }
  
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn(
        "rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse",
        sizeMap[size]
      )} />
    </div>
  )
}