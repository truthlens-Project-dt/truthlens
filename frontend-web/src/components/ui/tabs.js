import * as React from "react"

const cn = (...args) => args.filter(Boolean).join(' ');

const TabsContext = React.createContext(null);

const Tabs = ({ value, onValueChange, children, className }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  )
}

const TabsList = ({ children, className }) => (
  <div className={cn("inline-flex items-center justify-center rounded-lg bg-cyan-900/20 p-1", className)}>
    {children}
  </div>
)

const TabsTrigger = ({ value, children, className }) => {
  const { value: activeValue, onValueChange } = React.useContext(TabsContext);
  const isActive = activeValue === value;
  
  return (
    <button
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-[#0a0f1a] text-cyan-400 shadow" : "text-cyan-400/60 hover:text-cyan-400",
        className
      )}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ value, children, className }) => {
  const { value: activeValue } = React.useContext(TabsContext);
  if (activeValue !== value) return null;
  return <div className={cn("mt-2", className)}>{children}</div>
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
