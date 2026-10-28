import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { mockJobs } from '../data/jobs'
import { fetchJobs } from '../services/jobs'
import type { Account, ApplicationStatus, Employer, Job, JobApplication, UserProfile } from '../types'

type ToastKind = 'success' | 'error' | 'info'
interface Toast { id: string; message: string; kind: ToastKind }

interface AppState {
  accounts: Account[]
  activeUserId: string | null
  activeAdmin: boolean
  employers: Employer[]
  jobs: Job[]
  removedVacancyIds: string[]
  isFetchingJobs: boolean
  applications: JobApplication[]
  darkMode: boolean
  toasts: Toast[]
  getActiveAccount: () => Account | undefined
  signIn: (email: string, password: string) => boolean
  signInDemo: () => void
  signInAdmin: (email: string, password: string) => boolean
  signOutAdmin: () => void
  register: (email: string, password: string, fullName: string) => boolean
  signOut: () => void
  updateProfile: (profile: UserProfile) => void
  setResumeName: (name: string) => void
  setJobs: (jobs: Job[]) => void
  refreshJobs: () => Promise<void>
  applyForJob: (job: Job) => boolean
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void
  setAccountActive: (userId: string, active: boolean) => void
  removeAccount: (userId: string) => void
  saveEmployer: (employer: Employer) => void
  removeEmployer: (employerId: string) => void
  toggleEmployer: (employerId: string) => void
  saveVacancy: (job: Job) => void
  removeVacancy: (jobId: string) => void
  toggleTheme: () => void
  notify: (message: string, kind?: ToastKind) => void
  dismissToast: (id: string) => void
}

const demoAccount: Account = {
  email: 'demo@jobrec.ai',
  password: 'findyourfit',
  profile: {
    userId: 'demo-user-001', fullName: 'Mina Chen', gender: 'Prefer not to say', age: 29,
    educationalQualification: "Bachelor's in Computer Science", technicalSkills: ['React', 'TypeScript', 'Node.js', 'Accessibility', 'Figma'],
    workExperience: 4, certifications: ['AWS Cloud Practitioner', 'Professional Scrum Master I'],
    preferredJobRole: 'Frontend Engineer', preferredIndustry: 'Software', preferredLocation: 'Remote — United States',
    employmentType: 'Full-time', resumeFileName: '',
    bio: 'Product-minded frontend engineer who loves making complex tools feel clear and approachable. I care about accessible interfaces, thoughtful collaboration, and learning from the people who use what we build.',
  },
}

const initialEmployers: Employer[] = [
  { employerId: 'employer-northstar', companyName: 'Northstar Health', contactName: 'Jordan Lee', email: 'careers@northstar.example', industry: 'Healthcare Technology', status: 'Active', createdAt: '2026-08-12T12:00:00.000Z' },
  { employerId: 'employer-atlantic', companyName: 'Atlantic Energy Services', contactName: 'Nneka Okafor', email: 'talent@atlanticenergy.example', industry: 'Oil & Gas', status: 'Active', createdAt: '2026-09-04T12:00:00.000Z' },
  { employerId: 'employer-lattice', companyName: 'Lattice Labs', contactName: 'Morgan Reed', email: 'people@latticelabs.example', industry: 'Software', status: 'Paused', createdAt: '2026-09-18T12:00:00.000Z' },
]
const ADMIN_EMAIL = 'admin@jobrec.ai'
const ADMIN_PASSWORD = 'admin1234'

const newId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`

export const useAppStore = create<AppState>()(persist((set, get) => ({
  accounts: [demoAccount], activeUserId: null, activeAdmin: false, employers: initialEmployers, jobs: mockJobs, removedVacancyIds: [], isFetchingJobs: false, applications: [], darkMode: false, toasts: [],
  getActiveAccount: () => get().accounts.find((account) => account.profile.userId === get().activeUserId),
  signIn: (email, password) => {
    const match = get().accounts.find((account) => account.isActive !== false && account.email.toLowerCase() === email.trim().toLowerCase() && account.password === password)
    if (!match) return false
    set({ activeUserId: match.profile.userId })
    return true
  },
  signInDemo: () => set({ activeUserId: demoAccount.profile.userId }),
  signInAdmin: (email, password) => {
    if (email.trim().toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) return false
    set({ activeAdmin: true, activeUserId: null })
    return true
  },
  signOutAdmin: () => set({ activeAdmin: false }),
  register: (email, password, fullName) => {
    if (get().accounts.some((account) => account.email.toLowerCase() === email.trim().toLowerCase())) return false
    const id = newId()
    const profile: UserProfile = {
      userId: id, fullName: fullName.trim(), age: '', educationalQualification: '', technicalSkills: [], workExperience: 0,
      certifications: [], preferredJobRole: '', preferredIndustry: '', preferredLocation: '', employmentType: '', resumeFileName: '', bio: '',
    }
    set((state) => ({ accounts: [...state.accounts, { email: email.trim().toLowerCase(), password, profile }], activeUserId: id }))
    return true
  },
  signOut: () => set({ activeUserId: null }),
  updateProfile: (profile) => set((state) => ({ accounts: state.accounts.map((account) => account.profile.userId === profile.userId ? { ...account, profile } : account) })),
  setResumeName: (name) => set((state) => ({ accounts: state.accounts.map((account) => account.profile.userId === state.activeUserId ? { ...account, profile: { ...account.profile, resumeFileName: name } } : account) })),
  setJobs: (jobs) => set({ jobs }),
  refreshJobs: async () => {
    if (get().isFetchingJobs) return
    set({ isFetchingJobs: true })
    try {
      const managed = get().jobs.filter((job) => job.source === 'Admin posted')
      const fetched = await fetchJobs()
      const removed = new Set(get().removedVacancyIds)
      set({ jobs: [...fetched.filter((job) => !removed.has(job.jobId) && !managed.some((posted) => posted.jobId === job.jobId)), ...managed] })
    } catch { const removed = new Set(get().removedVacancyIds); set({ jobs: [...mockJobs.filter((job) => !removed.has(job.jobId)), ...get().jobs.filter((job) => job.source === 'Admin posted')] }) } finally { set({ isFetchingJobs: false }) }
  },
  applyForJob: (job) => {
    const account = get().getActiveAccount()
    if (!account) return false
    const exists = get().applications.some((application) => application.userId === account.profile.userId && application.job.jobId === job.jobId)
    if (exists) return false
    set((state) => ({ applications: [{ id: newId(), userId: account.profile.userId, job, status: 'Applied', appliedAt: new Date().toISOString() }, ...state.applications] }))
    return true
  },
  updateApplicationStatus: (id, status) => set((state) => ({ applications: state.applications.map((application) => application.id === id ? { ...application, status } : application) })),
  setAccountActive: (userId, active) => set((state) => ({ accounts: state.accounts.map((account) => account.profile.userId === userId ? { ...account, isActive: active } : account) })),
  removeAccount: (userId) => set((state) => ({ accounts: state.accounts.filter((account) => account.profile.userId !== userId), applications: state.applications.filter((application) => application.userId !== userId) })),
  saveEmployer: (employer) => set((state) => ({ employers: [...state.employers.filter((item) => item.employerId !== employer.employerId), employer] })),
  removeEmployer: (employerId) => set((state) => ({ employers: state.employers.filter((employer) => employer.employerId !== employerId) })),
  toggleEmployer: (employerId) => set((state) => ({ employers: state.employers.map((employer) => employer.employerId === employerId ? { ...employer, status: employer.status === 'Active' ? 'Paused' : 'Active' } : employer) })),
  saveVacancy: (job) => set((state) => ({ jobs: [...state.jobs.filter((item) => item.jobId !== job.jobId), job] })),
  removeVacancy: (jobId) => set((state) => ({ jobs: state.jobs.filter((job) => job.jobId !== jobId), removedVacancyIds: [...new Set([...state.removedVacancyIds, jobId])] })),
  toggleTheme: () => set((state) => ({ darkMode: !state.darkMode })),
  notify: (message, kind = 'success') => {
    const id = newId()
    set((state) => ({ toasts: [...state.toasts, { id, message, kind }] }))
    window.setTimeout(() => get().dismissToast(id), 4200)
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}), {
  name: 'jobrec-ai-v1',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({ accounts: state.accounts, activeUserId: state.activeUserId, activeAdmin: state.activeAdmin, employers: state.employers, jobs: state.jobs, removedVacancyIds: state.removedVacancyIds, applications: state.applications, darkMode: state.darkMode }),
}))
