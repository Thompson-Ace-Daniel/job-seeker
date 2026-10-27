import { ArrowRight, ArrowUpRight, BriefcaseBusiness, Check, ClipboardCheck, Compass, Flame, Plus, Sparkles, Target, TrendingUp, Upload } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CompanyAvatar, JobCard, StatusBadge } from '../components/common'
import { Animated, Button, Card, PageIntro, Skeleton } from '../components/ui'
import { profileCompleteness, recommendJobs } from '../lib/recommendations'
import { useAppStore } from '../store/app-store'

const relativeDate = (value: string) => {
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000))
  return days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`
}

export function DashboardPage() {
  const account = useAppStore((state) => state.getActiveAccount())
  const jobs = useAppStore((state) => state.jobs)
  const allApplications = useAppStore((state) => state.applications)
  const activeUserId = useAppStore((state) => state.activeUserId)
  const loading = useAppStore((state) => state.jobs.length === 0)
  const profile = account?.profile
  const applications = useMemo(() => allApplications.filter((item) => item.userId === activeUserId), [allApplications, activeUserId])
  const recommendations = useMemo(() => profile ? recommendJobs(profile, jobs).slice(0, 3) : [], [profile, jobs])
  const completeness = profile ? profileCompleteness(profile) : 0
  const firstName = profile?.fullName.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return <div className="dashboard-page">
    <PageIntro eyebrow="YOUR PERSONAL WORKSPACE" title={`${greeting}, ${firstName}.`} description="A little clarity for your next career move." action={<Link to="/app/search"><Button variant="outline" icon={<Compass size={16} />}>Explore all jobs</Button></Link>} />
    <div className="dashboard-hero-grid"><Animated className="welcome-panel"><div className="welcome-content"><div className="welcome-badge"><Sparkles size={13} /> YOUR WEEKLY SNAPSHOT</div><h2>Make your next move<br />with a little more <span>confidence.</span></h2><p>We found <strong>{jobs.length} opportunities</strong> to explore. Here are the ones that feel most like you.</p><Link to="/app/recommendations" className="welcome-link">View your matches <ArrowRight size={15} /></Link></div><div className="welcome-art"><div className="art-ring art-ring-one" /><div className="art-ring art-ring-two" /><div className="art-spark"><Sparkles size={29} /></div><span className="art-dot art-dot-a" /><span className="art-dot art-dot-b" /><span className="art-dot art-dot-c" /></div><div className="welcome-wave" /></Animated>
      <Animated className="stats-stack" delay={0.05}><Card className="stat-card stat-card-lilac"><div className="stat-top"><span className="stat-icon"><Target size={17} /></span><span className="stat-label">Best match</span></div><div className="stat-number">{recommendations[0]?.matchScore ?? 0}<small>%</small></div><div className="stat-caption">{recommendations[0]?.jobTitle || 'Complete your profile to start'}</div><span className="stat-trend"><TrendingUp size={13} /> Your strongest fit</span></Card><Card className="stat-card stat-card-mint"><div className="stat-top"><span className="stat-icon"><ClipboardCheck size={17} /></span><span className="stat-label">Applications</span></div><div className="stat-number">{applications.length}<small> total</small></div><div className="stat-caption">{applications.filter((app) => ['In Review', 'Interview', 'Offer'].includes(app.status)).length} moving forward</div><Link className="stat-link" to="/app/applications">Track progress <ArrowUpRight size={13} /></Link></Card></Animated></div>
    <div className="dashboard-section-heading"><div><div className="eyebrow">GOOD PLACES TO START</div><h2>Picked for your profile</h2></div><Link to="/app/recommendations" className="section-link">See all matches <ArrowRight size={15} /></Link></div>
    <div className="dashboard-job-grid">{loading ? [1, 2, 3].map((item) => <Card key={item} className="loading-job-card"><Skeleton className="skeleton-title" /><Skeleton className="skeleton-line" /><Skeleton className="skeleton-block" /></Card>) : recommendations.map((job, index) => <Animated key={job.jobId} delay={0.06 * index}><JobCard job={job} /></Animated>)}</div>
    <div className="dashboard-lower-grid"><Animated><Card className="profile-progress-card"><div className="card-heading-row"><div><div className="eyebrow">YOUR PROFILE</div><h3>Make the most of your matches</h3></div><span className="profile-progress-number">{completeness}%</span></div><p>A few more details help us find opportunities that fit you better.</p><div className="large-progress"><span style={{ width: `${completeness}%` }} /></div><div className="progress-next-step">{!profile?.technicalSkills.length ? <><span className="next-step-icon"><Plus size={15} /></span><span><strong>Add your skills</strong><small>We use these to find your best-fit roles.</small></span></> : !profile?.resumeFileName ? <><span className="next-step-icon"><Upload size={15} /></span><span><strong>Upload your resume</strong><small>Keep your career details together in one place.</small></span></> : <><span className="next-step-icon next-step-done"><Check size={15} /></span><span><strong>You’re off to a great start</strong><small>Keep your preferences fresh as your goals change.</small></span></>}<Link to="/app/profile" aria-label="Update profile"><ArrowRight size={16} /></Link></div><Link className="profile-card-cta" to="/app/profile">Update your profile <ArrowRight size={14} /></Link></Card></Animated>
      <Animated delay={0.08}><Card className="applications-preview"><div className="card-heading-row"><div><div className="eyebrow">KEEP MOMENTUM</div><h3>Recent applications</h3></div><Link to="/app/applications" className="icon-link" aria-label="View all applications"><ArrowUpRight size={16} /></Link></div>{applications.length ? <div className="recent-app-list">{applications.slice(0, 3).map((application) => <div className="recent-app-row" key={application.id}><CompanyAvatar company={application.job.companyName} size="sm" /><div className="recent-app-info"><strong>{application.job.jobTitle}</strong><small>{application.job.companyName} <span>·</span> {relativeDate(application.appliedAt)}</small></div><StatusBadge status={application.status} /></div>)}</div> : <div className="recent-empty"><span><BriefcaseBusiness size={18} /></span><p>Your next opportunity starts here.</p><Link to="/app/search">Browse open roles <ArrowRight size={13} /></Link></div>}</Card></Animated>
    </div>
    <div className="tip-banner"><span className="tip-icon"><Flame size={17} /></span><span><strong>A small tip</strong> — update your profile when your goals change, and your recommendations will keep up with you.</span><Link to="/app/profile" aria-label="Update profile"><ArrowRight size={16} /></Link></div>
  </div>
}
