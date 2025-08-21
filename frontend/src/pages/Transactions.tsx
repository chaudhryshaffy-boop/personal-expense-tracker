import { useEffect, useState } from 'react'
import { api } from '../services/api'
import type { Transaction } from '../types'

export default function Transactions() {
  const [items, setItems] = useState<Transaction[]>([])
  const [error, setError] = useState<string | null>(null)
  const [amount, setAmount] = useState<number>(0)
  const [type, setType] = useState<'income'|'expense'>('expense')
  const [description, setDescription] = useState('')
  const [accountId, setAccountId] = useState<number>(0)
  const [date, setDate] = useState<string>('')
  const [accounts, setAccounts] = useState<{id:number; name:string}[]>([])

  useEffect(() => {
    api.get('/transactions', { params: { limit: 20 } }).then(r => setItems(r.data)).catch(e => setError(e?.response?.data?.detail || 'Failed to load'))
    api.get('/accounts').then(r=>setAccounts(r.data))
  }, [])

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const payload = { amount, type, description, account_id: accountId, date: date || new Date().toISOString().slice(0,10), category_id: null, tags: [] as string[] }
      const resp = await api.post('/transactions', payload)
      setItems(prev => [resp.data, ...prev])
      setAmount(0); setDescription('')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to add transaction')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Transactions</h1>
      {error && <div className="text-danger">{error}</div>}
      <form onSubmit={onAdd} className="bg-card rounded shadow p-4 flex flex-wrap gap-2 items-end">
        <select className="border rounded px-3 py-2" value={type} onChange={e=>setType(e.target.value as any)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input className="border rounded px-3 py-2" type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <input className="border rounded px-3 py-2" type="number" placeholder="Amount" value={amount} onChange={e=>setAmount(Number(e.target.value))} />
        <select className="border rounded px-3 py-2" value={accountId} onChange={e=>setAccountId(Number(e.target.value))}>
          <option value={0} disabled>Select account</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <input className="border rounded px-3 py-2 flex-1" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
        <button className="bg-primary text-white rounded px-4 py-2">Add</button>
      </form>

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

