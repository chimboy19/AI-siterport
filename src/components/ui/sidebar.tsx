import * as React from "react"
import { cn } from "../../lib/utils"

// ─── Sidebar Root ───────────────────────────────────────────────────────────

interface SidebarContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContextValue>({
  open: true,
  setOpen: () => {},
  isMobile: false,
})

export function useSidebar() {
  return React.useContext(SidebarContext)
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
  style?: React.CSSProperties
}

export function SidebarProvider({
  children,
  defaultOpen = true,
  className,
  style,
}: SidebarProviderProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)")
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches)
      if (e.matches) setOpen(false)
    }
    handler(mq)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  return (
    <SidebarContext.Provider value={{ open, setOpen, isMobile }}>
      <div
        className={cn(
          "group/sidebar-wrapper flex min-h-svh w-full",
          className
        )}
        style={
          {
            "--sidebar-width": "16rem",
            "--sidebar-width-collapsed": "3.5rem",
            ...style,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

interface SidebarProps {
  children: React.ReactNode
  className?: string
}

export function Sidebar({ children, className }: SidebarProps) {
  const { open, isMobile } = useSidebar()

  if (isMobile) {
    return null // handled by SidebarMobile
  }

  return (
    <aside
      data-state={open ? "expanded" : "collapsed"}
      className={cn(
        "group relative flex h-screen w-[--sidebar-width] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
        !open && "w-[--sidebar-width-collapsed]",
        "shrink-0",
        className
      )}
    >
      {children}
    </aside>
  )
}

// ─── Sidebar Header ───────────────────────────────────────────────────────────

export function SidebarHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex h-14 shrink-0 items-center border-b border-sidebar-border px-4", className)}>
      {children}
    </div>
  )
}

// ─── Sidebar Content ─────────────────────────────────────────────────────────

export function SidebarContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-1 flex-col overflow-hidden", className)}>
      {children}
    </div>
  )
}

// ─── Sidebar Footer ───────────────────────────────────────────────────────────

export function SidebarFooter({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("mt-auto border-t border-sidebar-border p-4", className)}>
      {children}
    </div>
  )
}

// ─── Sidebar Group ─────────────────────────────────────────────────────────

export function SidebarGroup({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-1 px-2 py-2", className)}>
      {children}
    </div>
  )
}

// ─── Sidebar Group Label ─────────────────────────────────────────────────────

export function SidebarGroupLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        "mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50",
        className
      )}
    >
      {children}
    </p>
  )
}

// ─── Sidebar Menu ─────────────────────────────────────────────────────────────

export function SidebarMenu({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <ul className={cn("flex flex-col gap-0.5", className)}>{children}</ul>
  )
}

// ─── Sidebar Menu Item ────────────────────────────────────────────────────────

export function SidebarMenuItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <li className={cn("list-none", className)}>{children}</li>
}

// ─── Sidebar Menu Button ──────────────────────────────────────────────────────

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, asChild = false, isActive, children, ...props }, ref) => {
  const Comp = asChild ? React.Fragment : "button"

  if (asChild) {
    // When asChild, just render children with correct class cloning
    const child = React.Children.only(children) as React.ReactElement<
      React.HTMLAttributes<HTMLElement>
    >
    return React.cloneElement(child, {
      className: cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
        "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive &&
          "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
        child.props.className
      ),
    })
  }

  return (
    <Comp
      ref={ref}
      data-active={isActive}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
        "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive &&
          "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

// ─── Sidebar Trigger ──────────────────────────────────────────────────────────

export function SidebarTrigger({
  className,
  onClick,
}: {
  className?: string
  onClick?: () => void
}) {
  const { open, setOpen } = useSidebar()
  return (
    <button
      type="button"
      onClick={() => {
        setOpen(!open)
        onClick?.()
      }}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <line x1="9" x2="9" y1="3" y2="21" />
      </svg>
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  )
}

// ─── Sidebar Inset ────────────────────────────────────────────────────────────

export function SidebarInset({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <main className={cn("flex flex-1 flex-col overflow-auto", className)}>
      {children}
    </main>
  )
}
