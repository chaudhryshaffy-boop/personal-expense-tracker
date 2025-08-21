import { useEffect, useState } from 'react'
import { api } from '../services/api'
import type { Transaction } from '../types'

export default function Transactions() {
  const [items, setItems] = useState<Transaction[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get('/transactions', { params: { limit: 20 } })
      .then(r => setItems(r.data))
      .catch(e => setError(e?.response?.data?.detail || 'Failed to load'))
  }, [])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Transactions</h1>
      {error && <div className="text-danger">{error}</div>}
      <div className="bg-card rounded shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-background text-textSecondary">
            <tr>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Amount</th>
              <th className="text-left p-3">Description</th>
            </tr>
          </thead>
          <tbody>
            {items.map(tx => (
              <tr key={tx.id} className="border-t">
                <td className="p-3">{tx.date}</td>
                <td className="p-3">{tx.type}</td>
                <td className="p-3">{tx.amount.toFixed(2)}</td>
                <td className="p-3">{tx.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

