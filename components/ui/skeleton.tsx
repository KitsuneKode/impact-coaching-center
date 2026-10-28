import { cn } from "cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("rounded-md bg-foreground/[0.07]", className)}
      {...props}
    />
  )
}

export { Skeleton }
