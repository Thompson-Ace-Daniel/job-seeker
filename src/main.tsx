import React, { useEffect, type ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ToastViewport } from './components/common'
import { ApplicationsPage, RecommendationsPage, SearchJobsPage } from './pages/JobsPages'
import { DashboardPage } from './pages/DashboardPage'
import { LandingPage } from './pages/LandingPage'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import { ProfilePage } from './pages/ProfilePage'
import { useAppStore } from './store/app-store'
import './index.css'

function RootRoutes() {
  const activeUserId = useAppStore((state) => state.activeUserId)
  const darkMode = useAppStore((state) => state.darkMode)
  const refreshJobs = useAppStore((state) => state.refreshJobs)
  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode) }, [darkMode])
  useEffect(() => { void refreshJobs() }, [refreshJobs])
  const protectedPage = (element: ReactNode) => activeUserId ? element : <Navigate to="/login" replace />
  return <><Routes>
    <Route path="/" element={activeUserId ? <Navigate to="/app" replace /> : <LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/app" element={protectedPage(<AppShell />)}>
      <Route index element={<DashboardPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="recommendations" element={<RecommendationsPage />} />
      <Route path="search" element={<SearchJobsPage />} />
      <Route path="applications" element={<ApplicationsPage />} />
    </Route>
    <Route path="*" element={<Navigate to={activeUserId ? '/app' : '/'} replace />} />
  </Routes><ToastViewport /></>
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><RootRoutes /></BrowserRouter></React.StrictMode>)
