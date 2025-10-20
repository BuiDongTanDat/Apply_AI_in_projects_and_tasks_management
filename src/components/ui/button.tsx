import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[var(--brand)] text-[var(--brand-foreground)] shadow hover:bg-[var(--brand-hover)]",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-[var(--brand-hover)] hover:text-[var(--brand)]",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-[var(--brand-hover)] hover:text-[var(--brand)]",
        link: "text-[var(--brand)] underline-offset-4 hover:underline",
        // Menu variants
        menuItem: "w-full justify-start text-muted-foreground hover:bg-[var(--brand-hover)] hover:text-[var(--brand)] data-[active=true]:bg-[var(--brand)] data-[active=true]:text-[var(--brand-foreground)] hover:scale-105 active:scale-95 duration-150 transition-transform",
        menuSubmenu: "w-full justify-start text-muted-foreground hover:bg-[var(--brand-hover)] hover:text-[var(--brand)] data-[active=true]:bg-[var(--brand)] data-[active=true]:text-[var(--brand-foreground)] hover:scale-105 active:scale-95 duration-150 transition-transform",
        subMenuItem: "w-full justify-between font-normal text-muted-foreground hover:bg-[var(--brand-hover)] hover:text-[var(--brand)] data-[active=true]:bg-[var(--brand-hover)] data-[active=true]:text-[var(--brand)] data-[active=true]:font-semibold hover:scale-105 active:scale-95 duration-150 transition-transform",
        // Action button
        actionNormal: `
            rounded-sm
            bg-white
            text-gray-700
            border border-gray-200
            hover:bg-white/95
            hover:border-primary
            hover:ring-primary
            transition-all duration-150
        `,
        // CRUD Action Variants
        actionCreate: "bg-primary text-white hover:bg-primary/90 rounded-sm",
        actionRead: "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary rounded-sm",
        actionUpdate: "bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-sm",
        actionDelete: "bg-red-100 text-red-700 hover:bg-red-600 hover:text-white rounded-sm",
        tab: `
          bg-transparent
          shadow-none
          rounded-none
          px-2 pb-0 pt-2
          text-sm font-medium
          text-muted-foreground
          hover:text-primary
          hover:scale-105
          active:scale-95
          border-b-2 border-transparent
          transition-all duration-150
        `,
      },

      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
        menuItem: "h-auto px-3 py-2.5 gap-3",
        subMenuItem: "h-auto px-3 py-2 gap-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);


export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
