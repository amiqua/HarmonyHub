import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef(({ className, variant, ...props }, ref) => {
  let variantClass = "badge--default"
  if (variant === "accent") variantClass = "badge--accent"
  else if (variant === "danger" || variant === "destructive") variantClass = "badge--danger"
  else if (variant === "success") variantClass = "badge--success"
  else if (variant === "purple") variantClass = "badge--purple"

  return (
    <div ref={ref} className={cn("badge", variantClass, className)} {...props} />
  )
})
Badge.displayName = "Badge"

export { Badge }
