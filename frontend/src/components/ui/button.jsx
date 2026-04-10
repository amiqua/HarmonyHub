import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const Button = React.forwardRef(({ className, variant, size, asChild = false, isLoading, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  let variantClass = "btn--primary"
  if (variant === "secondary") variantClass = "btn--secondary"
  else if (variant === "outline") variantClass = "btn--outline"
  else if (variant === "ghost") variantClass = "btn--ghost"
  else if (variant === "destructive") variantClass = "btn--destructive"
  else if (variant === "link") variantClass = "btn--link"

  let sizeClass = "btn--md"
  if (size === "sm") sizeClass = "btn--sm"
  else if (size === "lg") sizeClass = "btn--lg"
  else if (size === "icon") sizeClass = "btn--icon"

  return (
    <Comp
      className={cn("btn", variantClass, sizeClass, isLoading && "btn--loading", className)}
      ref={ref}
      disabled={isLoading || props.disabled}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
