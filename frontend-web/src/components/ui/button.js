import * as React from "react"

const cn = (...args) => args.filter(Boolean).join(' ');

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    default: "bg-cyan-600 text-white shadow hover:bg-cyan-700",
    outline: "border border-cyan-500/30 bg-transparent shadow-sm hover:bg-cyan-500/10 hover:text-cyan-400",
    ghost: "hover:bg-cyan-500/10 hover:text-cyan-400",
  };

  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-8",
    icon: "h-9 w-9",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
