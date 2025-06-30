"use client"

import { cn } from "@/lib/utils"
import { Frown, Meh, Smile, Laugh } from "lucide-react"

interface PerformanceGaugeProps {
  value: number // Percentage value from 0 to 100
}

const getGaugeData = (value: number) => {
  if (value < 25) {
    return {
      color: "text-red-500",
      label: "Abaixo",
      Icon: Frown,
    }
  }
  if (value < 50) {
    return {
      color: "text-orange-500",
      label: "Razoável",
      Icon: Meh,
    }
  }
  if (value < 75) {
    return {
      color: "text-yellow-500",
      label: "Bom",
      Icon: Smile,
    }
  }
  return {
    color: "text-green-500",
    label: "Excelente",
    Icon: Laugh,
  }
}

export function ProgressThermometer({ value }: PerformanceGaugeProps) {
  const normalizedValue = Math.min(100, Math.max(0, value))
  // Map value (0-100) to rotation (-90 to 90 degrees)
  const rotation = (normalizedValue / 100) * 180 - 90
  const gaugeData = getGaugeData(normalizedValue)

  const colors = {
    red: '#ef4444',
    orange: '#f97316',
    yellow: '#eab308',
    green: '#22c55e'
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full p-4">
      <div className="relative w-56 h-28">
        {/* Gauge background using conic-gradient */}
        <div
          className="w-full h-full rounded-t-full overflow-hidden"
          style={{
            background: `conic-gradient(from 180deg at 50% 100%, ${colors.red} 0deg 45deg, ${colors.orange} 45deg 90deg, ${colors.yellow} 90deg 135deg, ${colors.green} 135deg 180deg)`,
          }}
        >
          {/* Inner transparent circle to create the arc effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[152px] h-[76px] bg-card rounded-t-full absolute bottom-0"></div>
          </div>
        </div>

        {/* Icons */}
        <div className="absolute inset-0 flex items-center justify-center">
            {/* Position icons along the arc */}
            <Frown className="absolute h-6 w-6 text-white" style={{ transform: 'translate(-62px, -18px)' }} />
            <Meh className="absolute h-6 w-6 text-white" style={{ transform: 'translate(-22px, -52px)' }} />
            <Smile className="absolute h-6 w-6 text-white" style={{ transform: 'translate(22px, -52px)' }} />
            <Laugh className="absolute h-6 w-6 text-white" style={{ transform: 'translate(62px, -18px)' }} />
        </div>

        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 w-0.5 h-[84px] origin-bottom transition-transform duration-500"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        >
          <div className="w-full h-full bg-gray-800 dark:bg-gray-300 rounded-t-full"></div>
        </div>
        {/* Needle center circle */}
        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-800 dark:bg-gray-300 rounded-full border-2 border-card"></div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-2xl font-bold text-foreground">{normalizedValue.toFixed(1)}%</p>
        <div className={cn("flex items-center justify-center gap-2 font-semibold", gaugeData.color)}>
            <gaugeData.Icon className="h-5 w-5" />
            <p className="text-lg">{gaugeData.label}</p>
        </div>
      </div>
    </div>
  )
}
