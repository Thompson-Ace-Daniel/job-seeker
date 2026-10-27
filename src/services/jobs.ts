import axios from 'axios'
import { mockJobs } from '../data/jobs'
import type { EmploymentType, Job } from '../types'

interface RemotiveJob {
  id: number
  title: string
  company_name: string
  category?: string
  description?: string
  candidate_required_location?: string
  job_type?: string
  salary?: string
  url: string
}

interface JobicyJob {
  id: number | string
  jobTitle: string
  companyName: string
  jobIndustry?: string[]
  jobType?: string[]
  jobGeo?: string
  jobLevel?: string
  jobExcerpt?: string
  jobDescription?: string
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  salaryPeriod?: string
  pubDate?: string
  url: string
}

interface ArbeitnowJob {
  slug: string
  title: string
  company_name: string
  description?: string
  remote?: boolean
  url: string
  tags?: string[]
  job_types?: string[]
  location?: string
}

const normalizeEmployment = (value = ''): EmploymentType => {
  const normalized = value.toLowerCase()
  if (normalized.includes('part')) return 'Part-time'
  if (normalized.includes('contract') || normalized.includes('freelance')) return 'Contract'
  if (normalized.includes('intern') || normalized.includes('working student') || normalized.includes('werkstudent')) return 'Internship'
  return 'Full-time'
}

const guessExperience = (description = '') => {
  const match = description.match(/(\d{1,2})\+?\s+years?/i)
  return match ? Number(match[1]) : 2
}

const skillVocabulary = ['React', 'TypeScript', 'JavaScript', 'Python', 'SQL', 'Node.js', 'AWS', 'Product Strategy', 'Figma', 'Java', 'Go', 'Kubernetes', 'Machine Learning', 'Communication', 'Analytics', 'CSS', 'Docker', 'GraphQL', 'Django', 'Accessibility', 'PostgreSQL', 'Vue', 'Angular', 'Swift', 'Tableau', 'Salesforce']
const findSkills = (text: string) => skillVocabulary.filter((skill) => new RegExp(skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(text))
const salary = (min?: number, max?: number, provided?: string) => {
  if (provided) return provided
  if (min && max) return `$${Math.round(min / 1000)}k – $${Math.round(max / 1000)}k / year`
  if (min) return `From $${Math.round(min / 1000)}k / year`
  return 'Compensation shared during hiring'
}

function fromRemotive(item: RemotiveJob): Job {
  const text = `${item.title} ${item.description ?? ''}`
  return {
    jobId: `remotive-${item.id}`, jobTitle: item.title, companyName: item.company_name,
    industry: item.category ?? 'Technology', jobDescription: (item.description ?? 'Join a distributed team to deliver meaningful product work.').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 380),
    requiredQualification: 'Relevant education or equivalent practical experience', requiredSkills: findSkills(text).slice(0, 7),
    requiredExperience: guessExperience(text), jobLocation: item.candidate_required_location || 'Remote',
    employmentType: normalizeEmployment(item.job_type), salaryRange: salary(undefined, undefined, item.salary),
    applyUrl: item.url, source: 'Remotive', matchScore: 0,
  }
}

function fromJobicy(item: JobicyJob): Job {
  const description = item.jobDescription ?? item.jobExcerpt ?? ''
  const text = `${item.jobTitle} ${description} ${(item.jobIndustry ?? []).join(' ')}`
  return {
    jobId: `jobicy-${item.id}`, jobTitle: item.jobTitle, companyName: item.companyName || 'Hiring company',
    industry: item.jobIndustry?.[0] || 'Technology', jobDescription: (description || 'Explore this remote opportunity directly with the employer.').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 380),
    requiredQualification: 'Relevant education or equivalent practical experience', requiredSkills: findSkills(text).slice(0, 7),
    requiredExperience: guessExperience(description), jobLocation: item.jobGeo || 'Remote',
    employmentType: normalizeEmployment((item.jobType ?? []).join(' ')), salaryRange: jobicySalary(item),
    applyUrl: item.url, source: 'Jobicy', matchScore: 0,
  }
}

function jobicySalary(item: JobicyJob) {
  if (!item.salaryMin && !item.salaryMax) return 'Compensation shared during hiring'
  const currency = item.salaryCurrency || 'USD'
  const format = (amount: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
  const range = item.salaryMin && item.salaryMax ? `${format(item.salaryMin)} – ${format(item.salaryMax)}` : format(item.salaryMin || item.salaryMax || 0)
  return `${range}${item.salaryPeriod ? ` / ${item.salaryPeriod}` : ''}`
}

export interface JobSearchRequest { query: string; role?: string; industry?: string; location?: string }

function jobicyTags(request: JobSearchRequest) {
  const primary = request.query.trim() || request.role?.trim() || ''
  const domain = `${request.role ?? ''} ${request.industry ?? ''}`.toLowerCase()
  const tags = [primary]
  if (/petroleum|oil.?and.?gas|gas engineer|rig|drill|upstream|reservoir|well engineer/.test(domain)) {
    tags.push('petroleum engineering', 'oil and gas', 'drilling engineer')
  }
  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))].slice(0, 3)
}

function jobicyIndustrySlug(industry = '') {
  const value = industry.toLowerCase()
  if (/software|technology|tech/.test(value)) return 'software-engineering'
  if (/petroleum|oil|gas|energy|engineering/.test(value)) return 'engineering'
  if (/data|analytics/.test(value)) return 'data-science'
  if (/design|creative/.test(value)) return 'design'
  if (/marketing|sales/.test(value)) return 'marketing'
  if (/finance|accounting/.test(value)) return 'finance'
  return ''
}

function jobicyGeoSlug(location = '') {
  const value = location.toLowerCase()
  if (/united states|\busa\b|\bus\b|america/.test(value)) return 'usa'
  if (/canada/.test(value)) return 'canada'
  if (/europe|uk|united kingdom/.test(value)) return 'europe'
  if (/asia|pacific|australia/.test(value)) return 'apac'
  return ''
}

export async function fetchTargetedJobicyJobs(request: JobSearchRequest): Promise<Job[]> {
  const tags = jobicyTags(request)
  const unique = new Map<string, Job>()
  await Promise.allSettled(tags.map(async (tag) => {
    const params = new URLSearchParams({ count: '50', tag })
    const industry = jobicyIndustrySlug(request.industry ?? '')
    const geo = jobicyGeoSlug(request.location ?? '')
    if (industry) params.set('industry', industry)
    if (geo) params.set('geo', geo)
    const { data } = await axios.get<{ jobs?: JobicyJob[]; success?: boolean; error?: string }>(`/api/jobicy?${params}`, { timeout: 12000 })
    if (data.success === false) throw new Error(data.error || 'Jobicy search failed')
    for (const item of data.jobs ?? []) unique.set(`jobicy-${item.id}`, fromJobicy(item))
  }))
  return [...unique.values()]
}

function fromArbeitnow(item: ArbeitnowJob): Job {
  const description = item.description ?? ''
  const skills = [...new Set([...(item.tags ?? []), ...findSkills(`${item.title} ${description}`)])].slice(0, 7)
  return {
    jobId: `arbeitnow-${item.slug}`, jobTitle: item.title, companyName: item.company_name || 'Hiring company',
    industry: item.tags?.[0] || 'Technology', jobDescription: (description || 'Explore this opportunity directly with the employer.').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 380),
    requiredQualification: 'Relevant education or equivalent practical experience', requiredSkills: skills,
    requiredExperience: guessExperience(description), jobLocation: item.remote ? `Remote — ${item.location || 'Europe'}` : item.location || 'Europe',
    employmentType: normalizeEmployment((item.job_types ?? []).join(' ')), salaryRange: 'Compensation shared during hiring',
    applyUrl: item.url, source: 'Arbeitnow', matchScore: 0,
  }
}

export async function fetchJobs(): Promise<Job[]> {
  const requests: Promise<Job[]>[] = [
    axios.get<{ jobs: RemotiveJob[] }>('https://remotive.com/api/remote-jobs?limit=50', { timeout: 9000 })
      .then(({ data }) => (data.jobs ?? []).map(fromRemotive)),
    axios.get<{ data: ArbeitnowJob[] }>('https://www.arbeitnow.com/api/job-board-api', { timeout: 9000 })
      .then(({ data }) => (data.data ?? []).map(fromArbeitnow)),
    axios.get<{ jobs: JobicyJob[] }>('/api/jobicy?count=50', { timeout: 9000 })
      .then(({ data }) => (data.jobs ?? []).map(fromJobicy)),
  ]
  const results = await Promise.allSettled(requests)
  const liveJobs = results.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
  const byId = new Map(liveJobs.map((job) => [job.jobId, job] as const))
  const uniqueLive = [...byId.values()]
  return [...uniqueLive, ...mockJobs.filter((job) => !byId.has(job.jobId))]
}
