import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Award, Briefcase, Check, FileText, MapPin, Pencil, Save, ShieldCheck, Sparkles, Trash2, Upload, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Animated } from '../components/ui'
import { Button, Card, Input, PageIntro, Textarea } from '../components/ui'
import { profileCompleteness } from '../lib/recommendations'
import { useAppStore } from '../store/app-store'
import type { EmploymentType, UserProfile } from '../types'

const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Add your full name'),
  gender: z.string(),
  age: z.string().refine((value) => !value || (Number(value) >= 16 && Number(value) <= 100), 'Enter an age between 16 and 100'),
  educationalQualification: z.string(), technicalSkills: z.string(), workExperience: z.string().refine((value) => value === '' || Number(value) >= 0, 'Experience can’t be negative'),
  certifications: z.string(), preferredJobRole: z.string(), preferredIndustry: z.string(), preferredLocation: z.string(), employmentType: z.string(), bio: z.string().max(600, 'Keep your bio under 600 characters'),
})
type ProfileForm = z.infer<typeof profileSchema>
const splitList = (value: string) => value.split(',').map((part) => part.trim()).filter(Boolean)
const employmentOptions: EmploymentType[] = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']

export function ProfilePage() {
  const account = useAppStore((state) => state.getActiveAccount())
  const updateProfile = useAppStore((state) => state.updateProfile)
  const setResumeName = useAppStore((state) => state.setResumeName)
  const notify = useAppStore((state) => state.notify)
  const profile = account!.profile
  const [editing, setEditing] = useState(profileCompleteness(profile) < 70)
  const completeness = profileCompleteness(profile)
  const defaults = useMemo<ProfileForm>(() => ({
    fullName: profile.fullName, gender: profile.gender ?? '', age: profile.age === '' ? '' : String(profile.age),
    educationalQualification: profile.educationalQualification, technicalSkills: profile.technicalSkills.join(', '),
    workExperience: String(profile.workExperience), certifications: profile.certifications.join(', '),
    preferredJobRole: profile.preferredJobRole, preferredIndustry: profile.preferredIndustry,
    preferredLocation: profile.preferredLocation, employmentType: profile.employmentType, bio: profile.bio,
  }), [profile])
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema), defaultValues: defaults })
  useEffect(() => reset(defaults), [defaults, reset])

  const saveProfile = (values: ProfileForm) => {
    const nextProfile: UserProfile = {
      ...profile, fullName: values.fullName.trim(), gender: values.gender || undefined,
      age: values.age ? Number(values.age) : '', educationalQualification: values.educationalQualification.trim(),
      technicalSkills: splitList(values.technicalSkills), workExperience: values.workExperience === '' ? 0 : Number(values.workExperience),
      certifications: splitList(values.certifications), preferredJobRole: values.preferredJobRole.trim(),
      preferredIndustry: values.preferredIndustry.trim(), preferredLocation: values.preferredLocation.trim(),
      employmentType: values.employmentType as EmploymentType | '', bio: values.bio.trim(),
    }
    updateProfile(nextProfile)
    setEditing(false)
    notify('Your profile is saved. Recommendations are already refreshed.')
  }

  const uploadResume = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'doc', 'docx'].includes(extension ?? '')) { notify('Choose a PDF, DOC, or DOCX resume.', 'error'); event.target.value = ''; return }
    setResumeName(file.name)
    notify(`${file.name} is saved to your profile.`)
    event.target.value = ''
  }

  const clearResume = () => { setResumeName(''); notify('Resume removed from your profile.', 'info') }
  const field = (label: string, name: keyof ProfileForm, placeholder: string, hint?: string) => <div className="form-field"><label className="form-label" htmlFor={name}>{label}</label><Input id={name} placeholder={placeholder} {...register(name)} />{hint && <small className="field-hint">{hint}</small>}{errors[name]?.message && <span className="field-error">{errors[name]?.message}</span>}</div>

  return <div className="profile-page">
    <PageIntro eyebrow="YOUR STORY, IN ONE PLACE" title="My profile" description="The more we know about what you’re looking for, the better we can match you." action={<span className="profile-id"><ShieldCheck size={14} /> Profile ID · {profile.userId.slice(0, 8)}</span>} />
    <div className="profile-layout"><Animated className="profile-primary"><Card className="profile-summary-card"><div className="profile-summary-main"><div className="profile-large-avatar">{profile.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase() || <UserRound size={25} />}</div><div className="profile-summary-info"><div className="profile-name-row"><h2>{profile.fullName || 'Your name'}</h2>{profile.preferredJobRole && <span className="profile-role-tag">{profile.preferredJobRole}</span>}</div><div className="profile-meta-row">{profile.educationalQualification && <span><Award size={14} />{profile.educationalQualification}</span>}{profile.preferredLocation && <span><MapPin size={14} />{profile.preferredLocation}</span>}</div></div><Button variant="outline" size="sm" icon={<Pencil size={14} />} onClick={() => setEditing((value) => !value)}>{editing ? 'Close editor' : 'Edit profile'}</Button></div><div className="profile-progress-summary"><div className="profile-progress-title"><span>Profile completeness</span><strong>{completeness}%</strong></div><div className="large-progress"><span style={{ width: `${completeness}%` }} /></div><small>Profile details help your recommendations reflect what matters to you.</small></div></Card>
      {editing ? <Card className="profile-form-card"><div className="profile-form-header"><div><div className="eyebrow">PROFILE DETAILS</div><h2>Let’s fill in your story.</h2><p>Use commas to separate skills and certifications.</p></div><span className="edit-icon"><Pencil size={17} /></span></div>
        <form onSubmit={handleSubmit(saveProfile)} className="profile-form" noValidate><div className="form-section-title"><span className="form-section-icon"><UserRound size={16} /></span><div><h3>About you</h3><p>A few details about who you are.</p></div></div><div className="form-grid">{field('Full name', 'fullName', 'Your full name')}<div className="form-field"><label className="form-label" htmlFor="gender">Gender <span className="optional-label">Optional</span></label><select className="field" id="gender" {...register('gender')}><option value="">Prefer not to say</option><option>Woman</option><option>Man</option><option>Non-binary</option><option>Self-describe</option></select></div>{field('Age', 'age', 'e.g. 28', 'Used only to complete your profile.')}{field('Educational qualification', 'educationalQualification', 'e.g. BSc Computer Science')}
          <div className="form-field"><label className="form-label" htmlFor="bio">Professional bio</label><Textarea id="bio" placeholder="A few sentences about your experience, interests, and what you enjoy working on..." rows={4} {...register('bio')} />{errors.bio && <span className="field-error">{errors.bio.message}</span>}</div></div>
          <div className="form-divider" /><div className="form-section-title"><span className="form-section-icon form-icon-indigo"><Briefcase size={16} /></span><div><h3>Skills & experience</h3><p>What you bring to your next team.</p></div></div><div className="form-grid">{field('Technical skills', 'technicalSkills', 'React, TypeScript, SQL', 'Separate each skill with a comma.')}{field('Work experience (years)', 'workExperience', 'e.g. 4')}{field('Certifications', 'certifications', 'AWS Cloud Practitioner, Scrum Master')}</div>
          <div className="form-divider" /><div className="form-section-title"><span className="form-section-icon form-icon-green"><Sparkles size={16} /></span><div><h3>What you’re looking for</h3><p>Help us bring the right roles your way.</p></div></div><div className="form-grid">{field('Preferred job role', 'preferredJobRole', 'e.g. Frontend Engineer')}{field('Preferred industry', 'preferredIndustry', 'e.g. Healthcare technology')}{field('Preferred location', 'preferredLocation', 'e.g. Remote — United States')}<div className="form-field"><label className="form-label" htmlFor="employmentType">Employment type</label><select className="field" id="employmentType" {...register('employmentType')}><option value="">Choose a preference</option>{employmentOptions.map((option) => <option key={option}>{option}</option>)}</select></div></div>
          <div className="profile-form-actions"><span><ShieldCheck size={14} /> Your details stay on this device</span><div><Button variant="ghost" type="button" onClick={() => { reset(defaults); setEditing(false) }}>Cancel</Button><Button type="submit" icon={<Save size={15} />} disabled={isSubmitting}>Save profile</Button></div></div>
        </form></Card> : <Card className="profile-details-card"><div className="card-heading-row"><div><div className="eyebrow">PROFILE OVERVIEW</div><h3>A snapshot of your experience</h3></div><button className="icon-link" onClick={() => setEditing(true)} aria-label="Edit profile"><Pencil size={15} /></button></div><div className="profile-data-grid"><ProfileData label="Email address" value={account?.email || '—'} /><ProfileData label="Gender" value={profile.gender || 'Not shared'} /><ProfileData label="Age" value={profile.age === '' ? 'Not added yet' : `${profile.age}`} /><ProfileData label="Education" value={profile.educationalQualification || 'Not added yet'} /><ProfileData label="Work experience" value={`${profile.workExperience} ${profile.workExperience === 1 ? 'year' : 'years'}`} /><ProfileData label="Industry" value={profile.preferredIndustry || 'Not added yet'} /><ProfileData label="Preferred role" value={profile.preferredJobRole || 'Not added yet'} /><ProfileData label="Location" value={profile.preferredLocation || 'Not added yet'} /><ProfileData label="Employment type" value={profile.employmentType || 'Not added yet'} /></div><div className="profile-data-section"><h4>Technical skills</h4><div className="profile-tag-list">{profile.technicalSkills.length ? profile.technicalSkills.map((skill) => <span className="profile-tag" key={skill}>{skill}</span>) : <span className="muted-copy">Add your skills to get more relevant matches.</span>}</div></div><div className="profile-data-section"><h4>Certifications</h4><div className="profile-tag-list">{profile.certifications.length ? profile.certifications.map((cert) => <span className="profile-tag" key={cert}><Award size={12} />{cert}</span>) : <span className="muted-copy">No certifications added.</span>}</div></div>{profile.bio && <div className="profile-bio"><h4>About</h4><p>{profile.bio}</p></div>}</Card>}
    </Animated>
    <Animated className="profile-sidebar" delay={0.08}><Card className="resume-card"><div className="resume-card-icon"><FileText size={20} /></div><div className="eyebrow">YOUR RESUME</div><h3>Keep your experience close.</h3><p>Save the name of your latest resume so it’s easy to find when you’re ready to apply.</p><label className={`resume-upload ${profile.resumeFileName ? 'resume-upload-done' : ''}`}><input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={uploadResume} />{profile.resumeFileName ? <><span className="resume-check"><Check size={14} /></span><span className="resume-file-name">{profile.resumeFileName}</span><span className="resume-change">Replace</span></> : <><Upload size={17} /><span>Choose a file</span><small>PDF or Word document</small></>}</label>{profile.resumeFileName && <button className="remove-resume" onClick={clearResume}><Trash2 size={13} /> Remove resume</button>}<div className="resume-note"><ShieldCheck size={14} /> We keep your file name on this device. Your resume file itself is not uploaded.</div></Card>
      <Card className="profile-tip-card"><span className="profile-tip-icon"><Sparkles size={17} /></span><h3>Better details,<br />better discoveries.</h3><p>Your skills and preferences help our recommendation engine surface roles that fit your goals.</p><div className="tip-card-footer"><span>Profile-powered matching</span><ArrowRight size={14} /></div></Card>
    </Animated></div>
  </div>
}

function ProfileData({ label, value }: { label: string; value: string }) { return <div className="profile-data-item"><span>{label}</span><strong>{value}</strong></div> }
