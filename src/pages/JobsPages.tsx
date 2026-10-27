import { ArrowDownWideNarrow, ArrowRight, ArrowUpRight, BriefcaseBusiness, Filter, MapPin, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CompanyAvatar, JobCard, StatusBadge } from '../components/common'
import { Animated, Button, Card, PageIntro, Skeleton } from '../components/ui'
import { recommendJobs } from '../lib/recommendations'
import { useAppStore } from '../store/app-store'
import { fetchTargetedJobicyJobs } from '../services/jobs'
import type { ApplicationStatus, EmploymentType, RankedJob } from '../types'

const employmentOptions: EmploymentType[] = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']
const statusOptions: ApplicationStatus[] = ['Applied', 'In Review', 'Interview', 'Offer', 'Rejected', 'Withdrawn']

export function RecommendationsPage() {
  const account = useAppStore((state) => state.getActiveAccount())
  const jobs = useAppStore((state) => state.jobs)
  const [view, setView] = useState('All matches')
  const [sort, setSort] = useState('Recommended')
  const recommendations = useMemo(() => account ? recommendJobs(account.profile, jobs) : [], [account, jobs])
  const shown = useMemo(() => {
    let filtered = recommendations
    if (view === 'Remote') filtered = filtered.filter((job) => job.jobLocation.toLowerCase().includes('remote'))
    if (view === 'Full-time') filtered = filtered.filter((job) => job.employmentType === 'Full-time')
    if (view === 'Strong matches') filtered = filtered.filter((job) => job.matchScore >= 55)
    return [...filtered].sort((a, b) => sort === 'Match score' ? b.matchScore - a.matchScore : sort === 'Newest' ? b.jobId.localeCompare(a.jobId) : b.matchScore - a.matchScore)
  }, [recommendations, sort, view])
  const views = ['All matches', 'Strong matches', 'Remote', 'Full-time']
  const refreshJobs = useAppStore((state) => state.refreshJobs)
  const [loading, setLoading] = useState(jobs.length === 0)
  useEffect(() => { if (!jobs.length) { void refreshJobs().finally(() => setLoading(false)) } }, [jobs.length, refreshJobs])
  return <div className="jobs-page"><PageIntro eyebrow="A LITTLE MORE YOU IN EVERY SEARCH" title="For you" description="Roles ranked by how closely they match your skills, preferences, and experience." action={<span className="results-total"><Sparkles size={15} />{jobs.length} opportunities</span>} />
    <Card className="recommendation-note"><span className="note-sparkle"><Sparkles size={16} /></span><div><strong>Your profile powers every match.</strong><p>We compare skills, role, industry, experience, location, and work type to find your strongest fits.</p></div><Link to="/app/profile">Tune your profile <ArrowRight size={14} /></Link></Card>
    <div className="jobs-toolbar"><div className="filter-tabs" role="tablist" aria-label="Filter recommendations">{views.map((item) => <button key={item} role="tab" aria-selected={view === item} className={`filter-tab ${view === item ? 'filter-tab-active' : ''}`} onClick={() => setView(item)}>{item}{item === 'All matches' && <span>{recommendations.length}</span>}</button>)}</div><label className="sort-control"><ArrowDownWideNarrow size={15} /><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort recommendations"><option>Recommended</option><option>Match score</option><option>Newest</option></select></label></div>
    {loading ? <JobSkeletonGrid /> : shown.length ? <div className="jobs-card-grid">{shown.map((job, index) => <Animated key={job.jobId} delay={(index % 6) * 0.035}><JobCard job={job} /></Animated>)}</div> : <EmptyJobs title="No roles in this group yet" description="Try another filter to see more opportunities." clear={() => setView('All matches')} />}
  </div>
}

export function SearchJobsPage() {
  const jobs = useAppStore((state) => state.jobs)
  const account = useAppStore((state) => state.getActiveAccount())
  const [jobicyJobs, setJobicyJobs] = useState<import('../types').Job[]>([])
  const [searchingJobicy, setSearchingJobicy] = useState(false)
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') || '')
  const [location, setLocation] = useState('')
  const [industry, setIndustry] = useState('')
  const [employment, setEmployment] = useState('')
  const [experience, setExperience] = useState('')
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [sort, setSort] = useState('Best match')
  const [refreshing, setRefreshing] = useState(jobs.length === 0)
  const refreshJobs = useAppStore((state) => state.refreshJobs)
  useEffect(() => { if (!jobs.length) void refreshJobs().finally(() => setRefreshing(false)) }, [jobs.length, refreshJobs])
  useEffect(() => { const urlQuery = params.get('q') || ''; if (urlQuery !== query) setQuery(urlQuery) }, [params])
  useEffect(() => {
    let active = true
    const timer = window.setTimeout(() => {
      setSearchingJobicy(true)
      void fetchTargetedJobicyJobs({ query, role: account?.profile.preferredJobRole, industry: account?.profile.preferredIndustry, location: location || account?.profile.preferredLocation })
        .then((results) => { if (active) setJobicyJobs(results) })
        .catch(() => { if (active) setJobicyJobs([]) })
        .finally(() => { if (active) setSearchingJobicy(false) })
    }, 450)
    return () => { active = false; window.clearTimeout(timer) }
  }, [query, location, account?.profile.preferredJobRole, account?.profile.preferredIndustry, account?.profile.preferredLocation])
  const combinedJobs = useMemo(() => [...new Map([...jobs, ...jobicyJobs].map((job) => [job.jobId, job])).values()], [jobs, jobicyJobs])
  const recommendations = useMemo(() => account ? recommendJobs(account.profile, combinedJobs) : combinedJobs as RankedJob[], [account, combinedJobs])
  const industries = useMemo(() => [...new Set(jobs.map((job) => job.industry).filter(Boolean))].sort(), [jobs])
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    let result = recommendations.filter((job) => {
      const searchText = `${job.jobTitle} ${job.companyName} ${job.industry} ${job.jobDescription} ${job.requiredSkills.join(' ')}`.toLowerCase()
      const jobLocation = job.jobLocation.toLowerCase()
      const locationMatch = !location.trim() || jobLocation.includes(location.trim().toLowerCase()) || /anywhere|worldwide|work from anywhere/i.test(job.jobLocation)
      const salaryMatch = !experience || job.requiredExperience <= Number(experience)
      return (!needle || searchText.includes(needle)) && locationMatch && (!industry || job.industry === industry) && (!employment || job.employmentType === employment) && salaryMatch && (!remoteOnly || job.jobLocation.toLowerCase().includes('remote'))
    })
    if (sort === 'Highest salary') result = [...result].sort((a, b) => salaryNumber(b.salaryRange) - salaryNumber(a.salaryRange))
    else if (sort === 'Lowest experience') result = [...result].sort((a, b) => a.requiredExperience - b.requiredExperience)
    else result = [...result].sort((a, b) => b.matchScore - a.matchScore)
    return result
  }, [recommendations, query, location, industry, employment, experience, remoteOnly, sort])
  const updateQuery = (value: string) => { setQuery(value); setParams(value ? { q: value } : {}) }
  const resetFilters = () => { setQuery(''); setParams({}); setLocation(''); setIndustry(''); setEmployment(''); setExperience(''); setRemoteOnly(false) }
  const activeFilters = Boolean(location || industry || employment || experience || remoteOnly)

  return <div className="jobs-page search-page"><PageIntro eyebrow="YOUR NEXT OPPORTUNITY" title="Search jobs" description="Explore a thoughtful mix of live openings and hand-picked roles." action={<span className="results-total"><span className="live-dot" />{jobs.length} roles available</span>} />
    <Card className="search-bar-card"><div className="main-search-input"><Search size={19} /><input aria-label="Search by role, skill, or company" value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Job title, skill, or company" /><button type="button" aria-label="Clear search" className={query ? 'clear-search visible' : 'clear-search'} onClick={() => updateQuery('')}><X size={16} /></button></div><button className={`filter-toggle ${showFilters ? 'filter-toggle-active' : ''}`} onClick={() => setShowFilters((value) => !value)}><SlidersHorizontal size={16} /> Filters{activeFilters && <span className="filter-count">{[location, industry, employment, experience, remoteOnly].filter(Boolean).length}</span>}</button></Card>
    {showFilters && <Card className="advanced-filters"><div className="filter-field"><label htmlFor="locationFilter"><MapPin size={13} /> Location</label><input id="locationFilter" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City, state, or remote" /></div><div className="filter-field"><label htmlFor="industryFilter">Industry</label><select id="industryFilter" value={industry} onChange={(event) => setIndustry(event.target.value)}><option value="">All industries</option>{industries.map((item) => <option key={item}>{item}</option>)}</select></div><div className="filter-field"><label htmlFor="employmentFilter">Employment type</label><select id="employmentFilter" value={employment} onChange={(event) => setEmployment(event.target.value)}><option value="">Any type</option>{employmentOptions.map((item) => <option key={item}>{item}</option>)}</select></div><div className="filter-field"><label htmlFor="experienceFilter">Experience required</label><select id="experienceFilter" value={experience} onChange={(event) => setExperience(event.target.value)}><option value="">Any experience</option><option value="0">Entry level (0 years)</option><option value="2">Up to 2 years</option><option value="4">Up to 4 years</option><option value="6">Up to 6 years</option></select></div><label className="remote-filter"><input type="checkbox" checked={remoteOnly} onChange={(event) => setRemoteOnly(event.target.checked)} /><span className="custom-checkbox" />Remote-friendly only</label>{activeFilters && <button className="clear-filters" onClick={resetFilters}>Clear all filters</button>}</Card>}
    <div className="search-results-heading"><div><div className="eyebrow">OPPORTUNITIES FOR YOU</div><h2>{filtered.length} {filtered.length === 1 ? 'role' : 'roles'} to explore{searchingJobicy ? ' · searching live jobs' : ''}</h2></div><label className="sort-control"><ArrowDownWideNarrow size={15} /><select aria-label="Sort search results" value={sort} onChange={(event) => setSort(event.target.value)}><option>Best match</option><option>Highest salary</option><option>Lowest experience</option></select></label></div>
    {refreshing || (searchingJobicy && !filtered.length) ? <JobSkeletonGrid /> : filtered.length ? <div className="jobs-card-grid">{filtered.map((job, index) => <Animated key={job.jobId} delay={(index % 8) * 0.025}><JobCard job={job} /></Animated>)}</div> : <EmptyJobs title="No roles fit those filters" description="Try another search or clear a few filters to see more." clear={resetFilters} />}
  </div>
}

export function ApplicationsPage() {
  const allApplications = useAppStore((state) => state.applications)
  const activeUserId = useAppStore((state) => state.activeUserId)
  const applications = useMemo(() => allApplications.filter((item) => item.userId === activeUserId).sort((a, b) => b.appliedAt.localeCompare(a.appliedAt)), [allApplications, activeUserId])
  const updateStatus = useAppStore((state) => state.updateApplicationStatus)
  const notify = useAppStore((state) => state.notify)
  const [statusFilter, setStatusFilter] = useState('All applications')
  const shown = applications.filter((item) => statusFilter === 'All applications' || item.status === statusFilter)
  const onStatus = (id: string, next: ApplicationStatus) => { updateStatus(id, next); notify(`Application status updated to ${next}.`, 'info') }
  return <div className="applications-page"><PageIntro eyebrow="YOUR CAREER MOMENTUM" title="Applications" description="Keep an eye on every opportunity you’ve explored." action={<Link to="/app/search"><Button icon={<BriefcaseBusiness size={15} />} variant="outline">Find more jobs</Button></Link>} />
    <div className="application-stats"><Card><span className="app-stat-icon app-stat-blue"><BriefcaseBusiness size={17} /></span><div><strong>{applications.length}</strong><span>Total applications</span></div></Card><Card><span className="app-stat-icon app-stat-lilac"><Sparkles size={17} /></span><div><strong>{applications.filter((item) => ['In Review', 'Interview', 'Offer'].includes(item.status)).length}</strong><span>In progress</span></div></Card><Card><span className="app-stat-icon app-stat-green"><ArrowUpRight size={17} /></span><div><strong>{applications.filter((item) => item.status === 'Offer').length}</strong><span>Offers</span></div></Card></div>
    <Card className="applications-list-card"><div className="applications-list-heading"><div><h2>Your application tracker</h2><p>Update a status whenever your search moves forward.</p></div><label className="sort-control"><Filter size={14} /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter applications"><option>All applications</option>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></label></div>
      {shown.length ? <div className="application-list">{shown.map((item) => <div className="application-row" key={item.id}><CompanyAvatar company={item.job.companyName} /><div className="application-role"><h3>{item.job.jobTitle}</h3><span>{item.job.companyName} <span className="dot-separator">·</span> {item.job.jobLocation}</span><small>Applied {new Date(item.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</small></div><div className="application-type"><span>Employment type</span><strong>{item.job.employmentType}</strong></div><div className="application-status"><span>Status</span><div className="status-select-wrap"><StatusBadge status={item.status} /><select aria-label={`Update status for ${item.job.jobTitle}`} value={item.status} onChange={(event) => onStatus(item.id, event.target.value as ApplicationStatus)}>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></div></div><a className="application-open" href={item.job.applyUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${item.job.jobTitle} application`}><ArrowUpRight size={17} /></a></div>)}</div> : <EmptyApplications hasAny={applications.length > 0} clear={() => setStatusFilter('All applications')} />}
    </Card><p className="tracker-note"><span className="tracker-note-icon"><Sparkles size={14} /></span>Status updates are saved to this device. Choose a status to keep your own tracker up to date.</p>
  </div>
}

function salaryNumber(value: string) { const amounts = value.replace(/,/g, '').match(/\$([\d.]+)(k)?/gi); if (!amounts?.length) return 0; return Math.max(...amounts.map((amount) => { const match = amount.match(/\$([\d.]+)(k)?/i); if (!match) return 0; return Number(match[1]) * (match[2] ? 1000 : 1) })) }
function JobSkeletonGrid() { return <div className="jobs-card-grid">{[1, 2, 3, 4, 5, 6].map((item) => <Card key={item} className="loading-job-card"><Skeleton className="skeleton-title" /><Skeleton className="skeleton-line" /><Skeleton className="skeleton-block" /></Card>)}</div> }
function EmptyJobs({ title, description, clear }: { title: string; description: string; clear: () => void }) { return <div className="empty-state"><span className="empty-state-icon"><Search size={21} /></span><h3>{title}</h3><p>{description}</p><Button variant="outline" onClick={clear}>Reset filters</Button></div> }
function EmptyApplications({ hasAny, clear }: { hasAny: boolean; clear: () => void }) { return <div className="empty-state empty-applications"><span className="empty-state-icon"><BriefcaseBusiness size={21} /></span><h3>{hasAny ? 'No applications with this status' : 'Your next opportunity starts here.'}</h3><p>{hasAny ? 'Choose a different status filter to see the rest of your tracker.' : 'When you apply to a role, it will appear here so you can follow your progress.'}</p>{hasAny ? <Button variant="outline" onClick={clear}>Show all applications</Button> : <Link to="/app/search"><Button>Explore open roles <ArrowRight size={15} /></Button></Link>}</div> }
