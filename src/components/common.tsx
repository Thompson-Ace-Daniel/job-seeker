import { ArrowUpRight, Building2, Check, MapPin, Sparkles, Wallet } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useAppStore } from '../store/app-store'
import type { Job, RankedJob } from '../types'
import { Badge, Button } from './ui'

export function BrandMark({ light = false }: { light?: boolean }) {
  return <div className={`brand-mark ${light ? 'brand-mark-light' : ''}`}><span className="brand-symbol"><Sparkles size={17} strokeWidth={2.5} /></span><span>jobrec<span className="brand-ai">.ai</span></span></div>
}

const logoColors = ['#6b77e6', '#188e8a', '#d28456', '#8664c7', '#3d83bb', '#c96879']
export function CompanyAvatar({ company, size = 'md' }: { company: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = company.split(/\s+/).slice(0, 2).map((part) => part.replace(/[^a-z0-9]/gi, '')[0]).join('').toUpperCase()
  const color = logoColors[company.charCodeAt(0) % logoColors.length]
  return <div className={`company-avatar avatar-${size}`} style={{ '--avatar-color': color } as CSSProperties}>{initials || <Building2 size={18} />}</div>
}

export function JobCard({ job, compact = false }: { job: Job | RankedJob; compact?: boolean }) {
  const active = useAppStore((state) => state.getActiveAccount())
  const applications = useAppStore((state) => state.applications)
  const applyForJob = useAppStore((state) => state.applyForJob)
  const notify = useAppStore((state) => state.notify)
  const isApplied = Boolean(active && applications.some((item) => item.userId === active.profile.userId && item.job.jobId === job.jobId))
  const ranked = 'matchedOn' in job ? job as RankedJob : undefined
  const handleApply = () => {
    const added = applyForJob(job)
    notify(added ? 'Application added to your tracker. Complete the application on the employer’s site.' : 'This opportunity is already in your application tracker.', added ? 'success' : 'info')
  }

  return <article className={`job-card ${compact ? 'job-card-compact' : ''}`}>
    <div className="job-card-main">
      <CompanyAvatar company={job.companyName} size={compact ? 'sm' : 'md'} />
      <div className="job-card-title-wrap"><div className="job-title-line"><h3>{job.jobTitle}</h3>{ranked && <Badge tone="brand" className="match-badge"><Sparkles size={12} /> {ranked.matchScore}% match</Badge>}</div><div className="company-line">{job.companyName}<span className="dot-separator">·</span>{job.industry}</div></div>
      <a className="job-external-icon" href={job.applyUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${job.jobTitle} at ${job.companyName}`}><ArrowUpRight size={17} /></a>
    </div>
    {!compact && <p className="job-description">{job.jobDescription}</p>}
    <div className="job-details">
      <span><MapPin size={14} />{job.jobLocation}</span><span><Wallet size={14} />{job.salaryRange}</span>
      {!compact && <span><Building2 size={14} />{job.employmentType}</span>}
    </div>
    <div className="job-skill-list">{job.requiredSkills.slice(0, compact ? 3 : 5).map((skill) => <span className="skill-chip" key={skill}>{skill}</span>)}{job.requiredSkills.length > (compact ? 3 : 5) && <span className="skill-overflow">+{job.requiredSkills.length - (compact ? 3 : 5)}</span>}</div>
    {ranked && ranked.matchedOn.length > 0 && <div className="matched-row"><span className="matched-label"><Check size={13} /> Matched on</span><span>{ranked.matchedOn.join(' · ')}</span></div>}
    <div className="job-card-footer"><span className="source-label">{job.source}</span><a className={`button ${isApplied ? 'button-outline' : 'button-primary'} button-sm apply-button`} href={job.applyUrl} target="_blank" rel="noopener noreferrer" onClick={handleApply}>{isApplied ? 'View job' : 'Apply'}<ArrowUpRight size={14} /></a></div>
  </article>
}

export function StatusBadge({ status }: { status: string }) {
  const tone = status === 'Offer' ? 'green' : status === 'Interview' ? 'brand' : status === 'Rejected' || status === 'Withdrawn' ? 'red' : status === 'In Review' ? 'amber' : 'neutral'
  return <Badge tone={tone}>{status}</Badge>
}

export function ToastViewport() {
  const toasts = useAppStore((state) => state.toasts)
  const dismiss = useAppStore((state) => state.dismissToast)
  return <div className="toast-viewport" aria-live="polite">{toasts.map((toast) => <div className={`toast toast-${toast.kind}`} key={toast.id}><span className="toast-dot" />{toast.message}<Button variant="ghost" size="sm" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification">×</Button></div>)}</div>
}
