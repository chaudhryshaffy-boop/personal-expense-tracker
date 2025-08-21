import { useDispatch, useSelector } from 'react-redux'
import { authActions } from '../../store/authSlice'
import type { RootState } from '../../store'

export default function Header() {
  const user = useSelector((s: RootState) => s.auth.user)
  const dispatch = useDispatch()
  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-4">
      <div className="font-semibold">Finance</div>
      <div className="flex items-center gap-3">
        {user && <span className="text-sm text-textSecondary">{user.email}</span>}
        <button className="text-sm px-3 py-1 rounded bg-danger text-white" onClick={() => dispatch(authActions.logout())}>Logout</button>
      </div>
    </header>
  )
}

