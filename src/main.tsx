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
import { AdminApplicationsPage, AdminDashboardPage, AdminEmployersPage, AdminLoginPage, AdminRecommendationsPage, AdminReportsPage, AdminUsersPage, AdminVacanciesPage, VacancyFormPage } from './pages/AdminPages'
import { AdminShell } from './components/AdminShell'
import { useAppStore } from './store/app-store'
import './index.css'

function RootRoutes() {
  const activeUserId = useAppStore((state) => state.activeUserId)
  const activeAdmin = useAppStore((state) => state.activeAdmin)
  const darkMode = useAppStore((state) => state.darkMode)
  const refreshJobs = useAppStore((state) => state.refreshJobs)
  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode) }, [darkMode])
  useEffect(() => { void refreshJobs() }, [refreshJobs])
  const protectedPage = (element: ReactNode) => activeUserId ? element : <Navigate to="/login" replace />
  return <><Routes>
    <Route path="/" element={activeUserId ? <Navigate to="/app" replace /> : <LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/admin/login" element={<AdminLoginPage />} />
    <Route path="/admin" element={activeAdmin ? <AdminShell /> : <Navigate to="/admin/login" replace />}>
      <Route index element={<AdminDashboardPage />} />
      <Route path="users" element={<AdminUsersPage />} />
      <Route path="employers" element={<AdminEmployersPage />} />
      <Route path="vacancies" element={<AdminVacanciesPage />} />
      <Route path="vacancies/new" element={<VacancyFormPage />} />
      <Route path="vacancies/:vacancyId/edit" element={<VacancyFormPage />} />
      <Route path="applications" element={<AdminApplicationsPage />} />
      <Route path="recommendations" element={<AdminRecommendationsPage />} />
      <Route path="reports" element={<AdminReportsPage />} />
    </Route>
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
