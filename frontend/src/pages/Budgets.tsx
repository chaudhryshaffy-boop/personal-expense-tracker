import { useEffect, useState } from 'react'
import { api } from '../services/api'

interface Budget { id: number; name: string; amount: number; period: string; alert_threshold: number; category_id: number }

export default function Budgets() {
  const [items, setItems] = useState<Budget[]>([])
  const [name, setName] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [categoryId, setCategoryId] = useState<number>(0)
  const [categories, setCategories] = useState<{id:number; name:string}[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get('/budgets').then(r=>setItems(r.data))
    api.get('/categories').then(r=>setCategories(r.data))
  }, [])

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const resp = await api.post('/budgets', { name, amount, category_id: categoryId, period: 'monthly' })
      setItems(prev => [...prev, resp.data])
      setName(''); setAmount(0)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to add budget')
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Budgets</h1>
      <form onSubmit={onAdd} className="bg-card p-4 rounded shadow flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm mb-1">Name</label>
          <input className="w-full border rounded px-3 py-2" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Amount</label>
          <input className="w-32 border rounded px-3 py-2" type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} />
        </div>
        <div>
          <label className="block text-sm mb-1">Category</label>
          <select className="w-48 border rounded px-3 py-2" value={categoryId} onChange={e=>setCategoryId(Number(e.target.value))}>
            <option value={0} disabled>Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button className="bg-primary text-white rounded px-4 py-2">Add</button>
      </form>

      <div className="bg-card rounded shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-background">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Amount</th>
              <th className="text-left p-3">Period</th>
            </tr>
          </thead>
          <tbody>
            {items.map(b => (
              <tr key={b.id} className="border-t">
                <td className="p-3">{b.name}</td>
                <td className="p-3">{b.amount.toFixed(2)}</td>
                <td className="p-3">{b.period}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && <div className="text-danger">{error}</div>}
    </div>
  )
}

