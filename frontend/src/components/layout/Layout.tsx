import { Link } from 'react-router-dom'
import Header from './Header'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-textPrimary">
      <Header />
      <div className="max-w-6xl mx-auto p-4">
        <nav className="mb-4 flex gap-4 text-sm">
          <Link to="/">Dashboard</Link>
          <Link to="/transactions">Transactions</Link>
          <Link to="/budgets">Budgets</Link>
        </nav>
        {children}
      </div>
    </div>
  )
}

