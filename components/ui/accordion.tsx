import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { IconPlus } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

/*
 * shadcn accordion (base-mira), restyled to the site: hairline rows instead of
 * a boxed list, a single plus that turns into a cross, and a real height
 * transition using Base UI's documented --accordion-panel-height pattern.
 */

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col border-t border-border", className)}
      {...props}
    />
  )
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-border", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/trigger flex flex-1 items-center justify-between gap-6 py-4 text-left text-base font-semibold text-foreground outline-none select-none",
          "transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          className
        )}
        {...props}
      >
        {children}
        <IconPlus
          aria-hidden
          size={18}
          stroke={1.6}
          className="shrink-0 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-panel-open/trigger:rotate-45 group-data-panel-open/trigger:text-foreground"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="h-[var(--accordion-panel-height)] overflow-hidden transition-[height] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] data-ending-style:h-0 data-starting-style:h-0"
      {...props}
    >
      <div
        className={cn(
          "max-w-[60ch] pr-10 pb-5 text-[0.9375rem] leading-relaxed text-muted-foreground",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
