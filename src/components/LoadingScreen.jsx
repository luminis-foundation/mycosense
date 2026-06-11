/**
 * LoadingScreen.jsx
 * Shown for first 1.5 seconds while sensor stream initializes.
 */

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-myco-soil flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-myco-moss animate-ping opacity-30 absolute inset-0" />
        <div className="w-16 h-16 rounded-full border border-myco-spore flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-myco-pulse animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <p className="font-display text-lg text-myco-mycel font-medium">MycoSense</p>
        <p className="text-xs font-mono text-myco-spore mt-1">initializing electrode array...</p>
      </div>
    </div>
  )
}
