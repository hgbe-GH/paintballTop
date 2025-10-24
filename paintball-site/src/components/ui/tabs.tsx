"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(component: string) {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error(`${component} must be used within <Tabs />`);
  }

  return context;
}

type TabsProps = React.ComponentProps<"div"> & {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
};

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    { defaultValue, value: controlledValue, onValueChange, className, children, ...props },
    ref
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);

    React.useEffect(() => {
      if (controlledValue === undefined) {
        setUncontrolledValue(defaultValue);
      }
    }, [defaultValue, controlledValue]);

    const currentValue = controlledValue ?? uncontrolledValue;

    const setValue = React.useCallback(
      (nextValue: string) => {
        if (controlledValue === undefined) {
          setUncontrolledValue(nextValue);
        }

        onValueChange?.(nextValue);
      },
      [controlledValue, onValueChange]
    );

    const contextValue = React.useMemo(
      () => ({ value: currentValue, setValue }),
      [currentValue, setValue]
    );

    return (
      <TabsContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("flex flex-col gap-4", className)}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = "Tabs";

type TabsListProps = React.ComponentProps<"div">;

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="tablist"
        className={cn("flex flex-wrap items-center gap-2", className)}
        {...props}
      />
    );
  }
);
TabsList.displayName = "TabsList";

type TabsTriggerProps = React.ComponentProps<"button"> & {
  value: string;
};

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, type = "button", ...props }, ref) => {
    const { value: activeValue, setValue } = useTabsContext("TabsTrigger");
    const isActive = activeValue === value;

    return (
      <button
        ref={ref}
        role="tab"
        type={type}
        data-state={isActive ? "active" : "inactive"}
        aria-selected={isActive}
        onClick={() => setValue(value)}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isActive
            ? "border-primary bg-primary text-primary-foreground shadow"
            : "border-transparent bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
          className
        )}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

type TabsContentProps = React.ComponentProps<"div"> & {
  value: string;
};

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const { value: activeValue } = useTabsContext("TabsContent");
    const isActive = activeValue === value;

    return (
      <div
        ref={ref}
        role="tabpanel"
        tabIndex={0}
        data-state={isActive ? "active" : "inactive"}
        className={cn(
          "mt-6 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          !isActive && "hidden",
          className
        )}
        {...props}
      />
    );
  }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsContent, TabsList, TabsTrigger };
