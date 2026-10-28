"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const SIZES = [10, 20, 30, 50] as const

/** The page-size picker both admin tables share. */
export function RowsPerPage({
  id,
  value,
  onChange,
}: {
  id: string
  value: number
  onChange: (size: number) => void
}) {
  const items = SIZES.map((size) => ({ label: `${size}`, value: `${size}` }))
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor={id} className="text-sm">
        Rows per page
      </Label>
      <Select
        value={`${value}`}
        onValueChange={(next) => {
          if (next) onChange(Number(next))
        }}
        items={items}
      >
        <SelectTrigger id={id} size="sm" className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
