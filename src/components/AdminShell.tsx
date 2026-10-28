import { Activity, BarChart3, BriefcaseBusiness, Building2, LayoutDashboard, LogOut, Moon, Sun, Users } from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BrandMark } from './common'
import { useAppStore } from '../store/app-store'

const adminLinks = [
  { to: '/admin', title: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', title: 'Manage users', icon: Users },
  { to: '/admin/employers', title: 'Manage employers', icon: Building2 },
  { to: '/admin/vacancies', title: 'Job vacancies', icon: BriefcaseBusiness },
  { to: '/admin/applications', title: 'Applications', icon: Activity },
  { to: '/admin/recommendations', title: 'Recommendation monitor', icon: BarChart3 },
  { to: '/admin/reports', title: 'Reports', icon: BarChart3 },
]

export function AdminShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const darkMode = useAppStore((state) => state.darkMode)
  const toggleTheme = useAppStore((state) => state.toggleTheme)
  const signOut = useAppStore((state) => state.signOutAdmin)
  const notify = useAppStore((state) => state.notify)
  const logout = () => { signOut(); notify('Administrator signed out.'); navigate('/admin/login', { replace: true }) }
  const current = adminLinks.find((item) => item.end ? location.pathname === item.to : location.pathname.startsWith(item.to))?.title ?? 'Overview'
  return <div className="app-shell admin-shell"><aside className="desktop-sidebar"><NavLink to="/admin" className="sidebar-brand"><BrandMark /></NavLink><div className="workspace-label"><span className="workspace-dot" />ADMIN CONSOLE</div><nav className="sidebar-nav admin-nav">{adminLinks.map(({ to, title, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}><Icon size={18} /><span>{title}</span></NavLink>)}</nav><div className="admin-sidebar-note"><strong>JobRec AI</strong><span>System administration</span></div></aside><div className="app-main-area"><header className="topbar"><div className="breadcrumb"><span>Administration</span><span className="breadcrumb-slash">/</span><strong>{current}</strong></div><div className="topbar-right"><span className="admin-session-label">Administrator</span><button className="theme-button" onClick={toggleTheme} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>{darkMode ? <Sun size={19} /> : <Moon size={19} />}</button><button className="button button-outline button-sm admin-logout" onClick={logout}><LogOut size={16} /> Logout</button></div></header><main className="page-content"><Outlet /></main><footer className="app-footer"><span>JobRec AI · Administrator workspace</span><span>System records are saved on this device.</span></footer></div></div>
}
