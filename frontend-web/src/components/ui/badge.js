import * as React from "react"

const cn = (...args) => args.filter(Boolean).join(' ');

function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "border-transparent bg-cyan-600 text-white shadow hover:bg-cyan-600/80",
    secondary: "border-transparent bg-cyan-900/40 text-cyan-400 hover:bg-cyan-900/60",
    outline: "text-cyan-400 border border-cyan-500/30",
    destructive: "border-transparent bg-red-600 text-white shadow hover:bg-red-600/80",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
