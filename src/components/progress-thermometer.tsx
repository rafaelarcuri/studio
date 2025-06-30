"use client"

import { cn } from "@/lib/utils"

interface ProgressThermometerProps {
  value: number // Percentage value from 0 to 100
}

export function ProgressThermometer({ value }: ProgressThermometerProps) {
  const normalizedValue = Math.min(100, Math.max(0, value))

  return (
    <div className="flex flex-col items-center">
        <div className="flex items-end justify-center h-48 w-20">
            <div className="relative w-8 h-full flex items-end">
                {/* Thermometer Tube */}
                <div className="w-full h-full bg-muted rounded-full border-2 border-border overflow-hidden">
                {/* Mercury fill */}
                <div
                    className={cn("w-full bg-primary transition-all duration-500")}
                    style={{ height: `${normalizedValue}%` }}
                ></div>
                </div>
                {/* Thermometer Bulb */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-2 border-border bg-muted flex items-center justify-center">
                    <div 
                        className={cn("w-10 h-10 rounded-full bg-primary transition-all duration-500")}
                    />
                </div>
                 {/* Markings */}
                <div className="absolute top-0 right-[-1.5rem] h-full text-xs text-muted-foreground flex flex-col-reverse justify-between py-3">
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                </div>
            </div>
        </div>
        <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">Progresso</p>
            <p className="text-2xl font-bold text-primary">{normalizedValue.toFixed(1)}%</p>
        </div>
    </div>
  )
}
