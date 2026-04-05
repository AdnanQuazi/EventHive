"use client"

import { Button } from "@/components/ui/button"
import { TrendingUp, ArrowRight } from "lucide-react"

const CHART_BAR_HEIGHTS = [42, 58, 65, 73, 61, 54, 68]
const TRANSACTION_AMOUNTS = [28.99, 74.5, 112.35]

export function DashboardCard() {
  return (
    <div className="glass-strong rounded-2xl p-6 transform rotate-12 float shadow-xl w-96 max-w-full">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Your space</h3>
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-accent" />
          </div>
        </div>

        {/* Balance */}
        <div className="space-y-1">
          <p className="text-3xl font-bold text-foreground">$34,809.89</p>
          <p className="text-sm text-muted-foreground">Total Balance</p>
        </div>

        {/* Chart Placeholder */}
        <div className="h-24 bg-gradient-to-br from-accent/20 to-pastel-blue/20 rounded-lg flex items-end justify-between p-3 gap-1">
          {CHART_BAR_HEIGHTS.map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-accent rounded-t"
              style={{
                height: `${height}%`,
              }}
            />
          ))}
        </div>

        {/* Transactions */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Transactions</p>
          <div className="space-y-2">
            {['Netflix', 'Maria Charles', 'Walmart'].map((name, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{name}</span>
                <span className="font-medium text-foreground">
                  ${TRANSACTION_AMOUNTS[i].toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Nested Cards */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="glass rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-foreground">Refer a friend</p>
            <p className="text-xs text-muted-foreground">and receive $50</p>
          </div>
          <div className="glass rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-foreground">It&apos;s time to pay</p>
            <p className="text-xs text-muted-foreground mb-2">your rent $2,000.00</p>
            <Button 
              size="sm"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs py-1 h-auto"
            >
              Pay now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
