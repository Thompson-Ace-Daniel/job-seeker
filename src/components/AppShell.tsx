import { BriefcaseBusiness, ChevronDown, CircleUserRound, Compass, LayoutDashboard, LogOut, Menu, Moon, Search, Sparkles, Sun, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BrandMark } from './common'
import { useAppStore } from '../store/app-store'

const navGroups = [
  { label: 'WORKSPACE', items: [
    { to: '/app', title: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/app/recommendations', title: 'For you', icon: Sparkles },
    { to: '/app/search', title: 'Search jobs', icon: Compass },
  ] },
  { label: 'YOUR JOURNEY', items: [
    { to: '/app/applications', title: 'Applications', icon: BriefcaseBusiness },
    { to: '/app/profile', title: 'My profile', icon: CircleUserRound },
  ] },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const account = useAppStore((state) => state.getActiveAccount())
  const completeness = account?.profile ? Math.round(([account.profile.fullName, account.profile.technicalSkills.length, account.profile.preferredJobRole, account.profile.resumeFileName].filter(Boolean).length / 4) * 100) : 0
  return <>
    <NavLink to="/app" className="sidebar-brand" onClick={onNavigate}><BrandMark /></NavLink>
    <div className="workspace-label"><span className="workspace-dot" />PERSONAL WORKSPACE<ChevronDown size={13} /></div>
    <nav className="sidebar-nav">{navGroups.map((group) => <div className="nav-group" key={group.label}><div className="nav-group-label">{group.label}</div>{group.items.map(({ to, title, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={onNavigate} className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}><Icon size={17} strokeWidth={1.8} /><span>{title}</span>{title === 'For you' && <span className="nav-new-dot" />}</NavLink>)}</div>)}</nav>
    <div className="sidebar-bottom"><div className="sidebar-profile-card"><div className="profile-card-head"><span>Profile strength</span><strong>{completeness}%</strong></div><div className="mini-progress"><span style={{ width: `${completeness}%` }} /></div><small>A fuller profile means better matches.</small><NavLink to="/app/profile" onClick={onNavigate}>Complete profile <ChevronDown size={12} /></NavLink></div>
      <div className="sidebar-user"><div className="user-avatar">{account?.profile.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'U'}</div><div className="sidebar-user-info"><strong>{account?.profile.fullName || 'Your profile'}</strong><small>{account?.email}</small></div><span className="user-online" /></div></div>
  </>
}

export function AppShell() {
  const [mobileNav, setMobileNav] = useState(false)
  const darkMode = useAppStore((state) => state.darkMode)
  const toggleTheme = useAppStore((state) => state.toggleTheme)
  const signOut = useAppStore((state) => state.signOut)
  const notify = useAppStore((state) => state.notify)
  const account = useAppStore((state) => state.getActiveAccount())
  const navigate = useNavigate()
  const location = useLocation()
  const isSearch = location.pathname === '/app/search'
  const [quickQuery, setQuickQuery] = useState('')
  const doSearch = (event: FormEvent) => { event.preventDefault(); navigate(`/app/search?q=${encodeURIComponent(quickQuery)}`) }
  const logout = () => { signOut(); notify('You’ve been signed out. See you next time.'); navigate('/login') }
  return <div className="app-shell">
    <aside className="desktop-sidebar"><SidebarContent /></aside>
    {mobileNav && <div className="mobile-nav-overlay" onClick={() => setMobileNav(false)}><aside className="mobile-sidebar" onClick={(event) => event.stopPropagation()}><div className="mobile-sidebar-top"><BrandMark /><button onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={20} /></button></div><SidebarContent onNavigate={() => setMobileNav(false)} /></aside></div>}
    <div className="app-main-area"><header className="topbar"><div className="topbar-left"><button className="mobile-menu-button" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={20} /></button><div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>{getPageName(location.pathname)}</strong></div></div><div className="topbar-right"><form className={`topbar-search ${isSearch ? 'topbar-search-active' : ''}`} onSubmit={doSearch}><Search size={16} /><input aria-label="Search jobs" placeholder="Search jobs, skills, companies..." value={quickQuery} onChange={(event) => setQuickQuery(event.target.value)} /><kbd>↵</kbd></form><button className="theme-button" onClick={toggleTheme} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>{darkMode ? <Sun size={17} /> : <Moon size={17} />}</button><button className="topbar-avatar" onClick={() => navigate('/app/profile')} aria-label="Open your profile">{account?.profile.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'U'}</button><button className="topbar-logout" onClick={logout} title="Sign out"><LogOut size={16} /></button></div></header><main className="page-content"><Outlet /></main><footer className="app-footer"><span>JobRec AI <span>·</span> Your next step, thoughtfully matched.</span><span>Jobs powered by Remotive, Arbeitnow, Jobicy, and our curated catalog.</span></footer></div>
  </div>
}

function getPageName(path: string) {
  if (path.endsWith('/profile')) return 'My profile'
  if (path.endsWith('/recommendations')) return 'For you'
  if (path.endsWith('/search')) return 'Search jobs'
  if (path.endsWith('/applications')) return 'Applications'
  return 'Overview'
}
