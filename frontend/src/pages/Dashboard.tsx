import React from 'react'

function Card({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-card shadow p-4">
      <h2 className="text-lg font-semibold text-textPrimary mb-2">{title}</h2>
      {children}
    </div>
  )
}

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Current Balance"><div className="text-3xl font-bold">$0.00</div></Card>
        <Card title="Income (This Month)"><div className="text-3xl font-bold text-success">$0.00</div></Card>
        <Card title="Expenses (This Month)"><div className="text-3xl font-bold text-danger">$0.00</div></Card>
      </div>
    </div>
  )
}

