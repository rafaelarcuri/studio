"use client"

import { useState } from "react"
import { Target } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface GoalSetterProps {
  onSetTarget: (target: number) => void
  children: React.ReactNode
}

export function GoalSetter({ onSetTarget, children }: GoalSetterProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")

  const handleSetTarget = () => {
    const targetAmount = parseFloat(amount)
    if (!isNaN(targetAmount) && targetAmount > 0) {
      onSetTarget(targetAmount)
      setAmount("")
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Definir Meta Global</DialogTitle>
          <DialogDescription>
            Defina uma meta de vendas para toda a equipe. Este valor será usado
            para acompanhar o progresso geral.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="target" className="text-right">
              Meta
            </Label>
            <div className="relative col-span-3">
              <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="target"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ex: 100000"
                className="pl-10"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSetTarget}>
            Salvar Meta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
