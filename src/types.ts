export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Freelance'

export interface UserProfile {
  userId: string
  fullName: string
  gender?: string
  age: number | ''
  educationalQualification: string
  technicalSkills: string[]
  workExperience: number
  certifications: string[]
  preferredJobRole: string
  preferredIndustry: string
  preferredLocation: string
  employmentType: EmploymentType | ''
  resumeFileName: string
  bio: string
}

export interface Account {
  email: string
  password: string
  profile: UserProfile
}

export interface Job {
  jobId: string
  jobTitle: string
  companyName: string
  industry: string
  jobDescription: string
  requiredQualification: string
  requiredSkills: string[]
  requiredExperience: number
  jobLocation: string
  employmentType: EmploymentType
  salaryRange: string
  applyUrl: string
  source: string
  matchScore: number
}

export type ApplicationStatus = 'Applied' | 'In Review' | 'Interview' | 'Offer' | 'Rejected' | 'Withdrawn'

export interface JobApplication {
  id: string
  userId: string
  job: Job
  status: ApplicationStatus
  appliedAt: string
}

export interface RankedJob extends Job {
  matchScore: number
  matchedOn: string[]
}
