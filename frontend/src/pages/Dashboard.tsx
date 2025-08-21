import React, { useEffect, useState } from 'react'
import { api } from '../services/api'

function Card({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-card shadow p-4">
      <h2 className="text-lg font-semibold text-textPrimary mb-2">{title}</h2>
      {children}
    </div>
  )
}

export default function Dashboard() {
  const [summary, setSummary] = useState<{balance:number; income:number; expenses:number; savingsRate:number; breakdown:{category:string; amount:number}[]}>()
  useEffect(() => {
    api.get('/dashboard/summary').then(r=>setSummary(r.data))
  }, [])
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Current Balance"><div className="text-3xl font-bold">${summary?.balance?.toFixed?.(2) ?? '0.00'}</div></Card>
        <Card title="Income (This Month)"><div className="text-3xl font-bold text-success">${summary?.income?.toFixed?.(2) ?? '0.00'}</div></Card>
        <Card title="Expenses (This Month)"><div className="text-3xl font-bold text-danger">${summary?.expenses?.toFixed?.(2) ?? '0.00'}</div></Card>
      </div>
      <div className="bg-card rounded shadow p-4">
        <h2 className="font-semibold mb-2">Expense Breakdown</h2>
        <ul className="text-sm space-y-1">
          {summary?.breakdown?.map(b => (
            <li key={b.category} className="flex justify-between">
              <span>{b.category}</span>
              <span>${b.amount.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

