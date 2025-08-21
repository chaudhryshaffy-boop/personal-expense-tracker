import './App.css'
import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import { useSelector } from 'react-redux'
import type { RootState } from './store'
import Layout from './components/layout/Layout'
import Budgets from './pages/Budgets'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useSelector((s: RootState) => s.auth.accessToken)
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-textPrimary">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Layout><Transactions /></Layout></ProtectedRoute>} />
          <Route path="/budgets" element={<ProtectedRoute><Layout><Budgets /></Layout></ProtectedRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
