"use client"

import { cn } from "@/lib/utils"

interface PerformanceGaugeProps {
  value: number // Percentage value from 0 to 100
}

const getPerformanceCategory = (value: number) => {
    if (value < 25) {
      return { name: "Abaixo", color: "text-red-500" };
    }
    if (value < 50) {
      return { name: "Razoável", color: "text-yellow-500" };
    }
    if (value < 75) {
      return { name: "Bom", color: "text-lime-500" };
    }
    return { name: "Excelente", color: "text-green-500" };
}

export function ProgressThermometer({ value }: PerformanceGaugeProps) {
  const normalizedValue = Math.min(100, Math.max(0, value))
  const category = getPerformanceCategory(normalizedValue);

  // Center the indicator. The indicator is 32px wide, so we offset by half (16px).
  const indicatorPosition = `calc(${normalizedValue}% - 16px)`

  return (
    <div className="w-full flex flex-col items-center pt-4 pb-0 px-2 space-y-2">
        {/* Main component wrapper */}
        <div className="w-full max-w-xs">
            
            {/* Labels */}
            <div className="flex justify-between text-[10px] font-medium text-gray-500 mb-1">
                <span className="w-1/4 text-center">ABAIXO</span>
                <span className="w-1/4 text-center">RAZOÁVEL</span>
                <span className="w-1/4 text-center">BOM</span>
                <span className="w-1/4 text-center">EXCELENTE</span>
            </div>

            {/* Color Bar */}
            <div className="relative h-2.5 w-full flex rounded-full overflow-hidden bg-gray-200 shadow-inner">
                <div className="w-full h-full flex">
                    <div className="w-1/4 bg-red-500"></div>
                    <div className="w-1/4 bg-yellow-500"></div>
                    <div className="w-1/4 bg-lime-500"></div>
                    <div className="w-1/4 bg-green-500"></div>
                </div>
            </div>

            {/* Indicator Rail */}
            <div className="relative h-8 w-full mt-[-4px]">
                <div
                    className="absolute top-0 transition-all duration-300"
                    style={{ left: indicatorPosition }} 
                >
                    {/* Indicator Body */}
                    <div className="relative flex flex-col items-center w-8">
                         {/* Value Box */}
                        <div className="bg-slate-700 text-white text-xs font-bold px-1.5 py-0.5 rounded-sm shadow-md z-10">
                            {normalizedValue.toFixed(0)}
                        </div>
                        {/* Triangle Pointer */}
                        <div className="w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-700 -mt-1"></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Textual Feedback */}
        <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{normalizedValue.toFixed(1)}%</p>
            <p className={cn("text-lg font-semibold", category.color)}>{category.name}</p>
        </div>
    </div>
  )
}
