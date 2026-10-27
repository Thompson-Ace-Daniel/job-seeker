import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { mockJobs } from '../data/jobs'
import { fetchJobs } from '../services/jobs'
import type { Account, ApplicationStatus, Job, JobApplication, UserProfile } from '../types'

type ToastKind = 'success' | 'error' | 'info'
interface Toast { id: string; message: string; kind: ToastKind }

interface AppState {
  accounts: Account[]
  activeUserId: string | null
  jobs: Job[]
  isFetchingJobs: boolean
  applications: JobApplication[]
  darkMode: boolean
  toasts: Toast[]
  getActiveAccount: () => Account | undefined
  signIn: (email: string, password: string) => boolean
  signInDemo: () => void
  register: (email: string, password: string, fullName: string) => boolean
  signOut: () => void
  updateProfile: (profile: UserProfile) => void
  setResumeName: (name: string) => void
  setJobs: (jobs: Job[]) => void
  refreshJobs: () => Promise<void>
  applyForJob: (job: Job) => boolean
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void
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

const newId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`

export const useAppStore = create<AppState>()(persist((set, get) => ({
  accounts: [demoAccount], activeUserId: null, jobs: mockJobs, isFetchingJobs: false, applications: [], darkMode: false, toasts: [],
  getActiveAccount: () => get().accounts.find((account) => account.profile.userId === get().activeUserId),
  signIn: (email, password) => {
    const match = get().accounts.find((account) => account.email.toLowerCase() === email.trim().toLowerCase() && account.password === password)
    if (!match) return false
    set({ activeUserId: match.profile.userId })
    return true
  },
  signInDemo: () => set({ activeUserId: demoAccount.profile.userId }),
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
    try { set({ jobs: await fetchJobs() }) } catch { set({ jobs: mockJobs }) } finally { set({ isFetchingJobs: false }) }
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
  partialize: (state) => ({ accounts: state.accounts, activeUserId: state.activeUserId, jobs: state.jobs, applications: state.applications, darkMode: state.darkMode }),
}))
