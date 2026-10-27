import type { Job, RankedJob, UserProfile } from '../types'

const clean = (value: string) => value.toLowerCase().replace(/[^a-z0-9+#.]+/g, ' ').trim()
const tokens = (value: string) => clean(value).split(/\s+/).filter((token) => token.length > 1 && !['and', 'the', 'for', 'with', 'of', 'or'].includes(token))
const skillAliases: Record<string, string> = { 'js': 'javascript', 'ts': 'typescript', 'reactjs': 'react', 'node': 'nodejs', 'node js': 'nodejs', 'postgres': 'postgresql', 'ml': 'machinelearning', 'machine learning': 'machinelearning', 'ux': 'userexperience', 'ui': 'userinterface' }
const normalizeSkill = (value: string) => skillAliases[clean(value)] ?? clean(value).replace(/\s+/g, '')

const petroleumTerms = /petroleum|oil\s*(?:and|&)\s*gas|gas engineering|rig|drill(?:ing)?|reservoir|well engineering|upstream|subsea|hydrocarbon|pipeline|refinery|production operations/
const careerDomain = (value: string) => {
  const text = clean(value)
  if (petroleumTerms.test(text)) return 'petroleum'
  if (/software|frontend|front end|backend|back end|full stack|web developer|devops|programming|computer science/.test(text)) return 'software'
  return ''
}

const roleFamily = (value: string) => {
  const text = clean(value)
  if (/front.?end|frontend|web developer/.test(text)) return 'frontend'
  if (/back.?end|backend|platform engineer/.test(text)) return 'backend'
  if (/full.?stack/.test(text)) return 'fullstack'
  if (/data|business intelligence|analytics/.test(text)) return 'data'
  if (/product manager|product management/.test(text)) return 'product'
  if (/designer|design/.test(text)) return 'design'
  if (/machine learning|ml engineer|research scientist/.test(text)) return 'machinelearning'
  if (/devops|site reliability|sre/.test(text)) return 'devops'
  if (/security|cybersecurity/.test(text)) return 'security'
  return ''
}

function buildProfileVector(profile: UserProfile) {
  const vector: Record<string, number> = {}
  const add = (key: string, weight: number) => { vector[key] = (vector[key] ?? 0) + weight }

  const domain = careerDomain(`${profile.preferredJobRole} ${profile.preferredIndustry} ${profile.educationalQualification}`)
  if (domain) add(`domain:${domain}`, 3.2)

  for (const skill of profile.technicalSkills) add(`skill:${normalizeSkill(skill)}`, 1.25)
  const profileRole = roleFamily(profile.preferredJobRole)
  if (profileRole) add(`role:${profileRole}`, 1.35)
  for (const token of tokens(profile.preferredJobRole)) add(`roleword:${token}`, 0.42)
  for (const token of tokens(profile.preferredIndustry)) add(`industry:${token}`, 1.1)
  const profileLocation = clean(profile.preferredLocation)
  const profileRemote = profileLocation.includes('remote')
  if (profileRemote) add('location:remote', 0.9)
  if (!profileRemote) for (const token of tokens(profile.preferredLocation)) add(`location:${token}`, 0.9)
  if (profile.employmentType) add(`employment:${profile.employmentType}`, 0.82)
  const profileYears = Math.min(12, Math.max(0, profile.workExperience))
  for (let year = 1; year <= profileYears; year += 1) add(`experience:${year}`, 0.82)
  return vector
}

function buildJobVector(job: Job) {
  const vector: Record<string, number> = {}
  const add = (key: string, weight: number) => { vector[key] = (vector[key] ?? 0) + weight }
  const domain = careerDomain(`${job.jobTitle} ${job.industry} ${job.requiredQualification} ${job.jobDescription}`)
  if (domain) add(`domain:${domain}`, 3.2)
  for (const skill of job.requiredSkills) add(`skill:${normalizeSkill(skill)}`, 1.25)
  const jobRole = roleFamily(job.jobTitle)
  if (jobRole) add(`role:${jobRole}`, 1.35)
  for (const token of tokens(job.jobTitle)) add(`roleword:${token}`, 0.42)
  for (const token of tokens(job.industry)) add(`industry:${token}`, 1.1)
  const jobLocation = clean(job.jobLocation)
  const jobRemote = jobLocation.includes('remote')
  if (jobRemote) add('location:remote', 0.9)
  if (!jobRemote) for (const token of tokens(job.jobLocation)) add(`location:${token}`, 0.9)
  add(`employment:${job.employmentType}`, 0.82)
  const requiredYears = Math.min(12, Math.max(0, job.requiredExperience))
  for (let year = 1; year <= requiredYears; year += 1) add(`experience:${year}`, 0.82)
  return vector
}

function cosineSimilarity(left: Record<string, number>, right: Record<string, number>) {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)])
  let dot = 0
  let leftMagnitude = 0
  let rightMagnitude = 0
  for (const key of keys) {
    const a = left[key] ?? 0
    const b = right[key] ?? 0
    dot += a * b
    leftMagnitude += a * a
    rightMagnitude += b * b
  }
  if (!leftMagnitude || !rightMagnitude) return 0
  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude))
}

function matchedSignals(profile: UserProfile, job: Job) {
  const jobSkills = new Set(job.requiredSkills.map(normalizeSkill))
  const sharedSkills = profile.technicalSkills.filter((skill) => jobSkills.has(normalizeSkill(skill)))
  const signals = sharedSkills.slice(0, 3)
  const profileLocation = clean(profile.preferredLocation)
  const jobLocation = clean(job.jobLocation)
  if (profileLocation.includes('remote') && jobLocation.includes('remote')) signals.push('Remote')
  else if (profileLocation && !profileLocation.includes('remote') && jobLocation.includes(profileLocation)) signals.push('Location')
  if (profile.workExperience >= job.requiredExperience && job.requiredExperience > 0) signals.push(`${job.requiredExperience}+ years`)
  if (roleFamily(profile.preferredJobRole) && roleFamily(profile.preferredJobRole) === roleFamily(job.jobTitle)) signals.push(job.jobTitle)
  if (profile.preferredIndustry && clean(profile.preferredIndustry) === clean(job.industry)) signals.push(job.industry)
  if (profile.employmentType && profile.employmentType === job.employmentType) signals.push(job.employmentType)
  return [...new Set(signals)].slice(0, 5)
}

export function recommendJobs(profile: UserProfile, jobs: Job[]): RankedJob[] {
  const profileVector = buildProfileVector(profile)
  const profileDomain = careerDomain(`${profile.preferredJobRole} ${profile.preferredIndustry} ${profile.educationalQualification}`)
  return jobs.filter((job) => !profileDomain || careerDomain(`${job.jobTitle} ${job.industry} ${job.requiredQualification} ${job.jobDescription}`) === profileDomain).map((job) => {
    const jobVector = buildJobVector(job)
    const score = Math.max(0, Math.min(100, Math.round(cosineSimilarity(profileVector, jobVector) * 100)))
    return { ...job, matchScore: score, matchedOn: matchedSignals(profile, job) }
  }).sort((a, b) => b.matchScore - a.matchScore || a.jobTitle.localeCompare(b.jobTitle))
}

export function profileCompleteness(profile: UserProfile) {
  const checks = [
    Boolean(profile.fullName.trim()), profile.age !== '', Boolean(profile.educationalQualification.trim()),
    profile.technicalSkills.length > 0, profile.workExperience >= 0, profile.certifications.length > 0,
    Boolean(profile.preferredJobRole.trim()), Boolean(profile.preferredIndustry.trim()), Boolean(profile.preferredLocation.trim()),
    Boolean(profile.employmentType), Boolean(profile.resumeFileName), Boolean(profile.bio.trim()),
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}
