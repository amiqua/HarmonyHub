import * as React from "react"
import { cn } from "@/lib/utils"

const Skeleton = ({ className, variant = "text", ...props }) => {
  return (
    <div
      className={cn("skeleton", `skeleton--${variant}`, className)}
      {...props}
    />
  )
}

export { Skeleton }
