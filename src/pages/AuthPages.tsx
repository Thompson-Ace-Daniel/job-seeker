import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { BrandMark } from '../components/common'
import { Button, Input } from '../components/ui'
import { useAppStore } from '../store/app-store'

const loginSchema = z.object({ email: z.string().email('Enter a valid email address'), password: z.string().min(1, 'Enter your password') })
const registerSchema = z.object({ fullName: z.string().trim().min(2, 'Please enter your name'), email: z.string().email('Enter a valid email address'), password: z.string().min(8, 'Use at least 8 characters') })
type LoginValues = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>

function AuthBenefits() {
  return <div className="auth-benefits"><div className="eyebrow eyebrow-light">YOUR NEXT CHAPTER STARTS HERE</div><h2>Find a role that<br />fits your <span>whole story.</span></h2><p>Thoughtful recommendations, made around your skills and the way you want to work.</p><div className="auth-proof"><div className="proof-avatars"><span>J</span><span>M</span><span>A</span><span>+4k</span></div><div><strong>Built around you</strong><small>Better matches. Less scrolling.</small></div></div></div>
}

function AuthShell({ children, mode }: { children: ReactNode; mode: 'login' | 'register' }) {
  return <main className="auth-page"><div className="auth-left"><Link to="/" className="auth-brand"><BrandMark /></Link><div className="auth-form-area">{children}</div><div className="auth-copyright">© 2026 JobRec AI <span>·</span> A little more you in every search.</div></div><aside className={`auth-right auth-right-${mode}`}><div className="auth-orb auth-orb-one" /><div className="auth-orb auth-orb-two" /><div className="auth-right-top"><span className="live-indicator" /> PERSONALIZED JOB DISCOVERY</div><AuthBenefits /><div className="auth-footnote"><CheckCircle2 size={15} /> Your profile stays yours, always.</div></aside></main>
}

export function LoginPage() {
  const isAuthed = useAppStore((state) => Boolean(state.activeUserId))
  const signIn = useAppStore((state) => state.signIn)
  const signInDemo = useAppStore((state) => state.signInDemo)
  const notify = useAppStore((state) => state.notify)
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })
  if (isAuthed) return <Navigate to="/app" replace />
  const submit = (values: LoginValues) => {
    if (signIn(values.email, values.password)) { notify('Welcome back. Your job search is ready.'); navigate('/app') }
    else notify('We couldn’t find an account with those details. Try the demo or create an account.', 'error')
  }
  const demo = () => { signInDemo(); notify('Welcome to your demo workspace.'); navigate('/app') }
  return <AuthShell mode="login"><Link to="/" className="back-link"><ArrowLeft size={15} /> Back to home</Link><div className="auth-heading"><span className="auth-kicker">WELCOME BACK</span><h1>Good to see you.</h1><p>Sign in to pick up where your next move begins.</p></div>
    <form className="auth-form" onSubmit={handleSubmit(submit)} noValidate>
      <label className="form-label" htmlFor="email">Email address</label><div className="input-icon-wrap"><Mail size={17} /><Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} /></div>{errors.email && <span className="field-error">{errors.email.message}</span>}
      <div className="label-row"><label className="form-label" htmlFor="password">Password</label><span className="form-hint">Your account is stored on this device</span></div><div className="input-icon-wrap"><LockKeyhole size={17} /><Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Your password" {...register('password')} /><button type="button" className="field-reveal" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>{errors.password && <span className="field-error">{errors.password.message}</span>}
      <Button type="submit" size="lg" className="auth-submit" disabled={isSubmitting}>Sign in <ArrowRight size={17} /></Button>
    </form><div className="auth-divider"><span />or<span /></div><Button variant="outline" size="lg" className="demo-button" onClick={demo}>Explore the demo <ArrowRight size={16} /></Button><p className="auth-switch">New to JobRec? <Link to="/register">Create your account</Link></p>
  </AuthShell>
}

export function RegisterPage() {
  const isAuthed = useAppStore((state) => Boolean(state.activeUserId))
  const registerAccount = useAppStore((state) => state.register)
  const notify = useAppStore((state) => state.notify)
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { fullName: '', email: '', password: '' } })
  if (isAuthed) return <Navigate to="/app" replace />
  const submit = (values: RegisterValues) => {
    if (!registerAccount(values.email, values.password, values.fullName)) { notify('An account with that email already exists. Sign in instead.', 'error'); return }
    notify('Your account is ready. Add a few details to get better matches.'); navigate('/app/profile')
  }
  return <AuthShell mode="register"><Link to="/" className="back-link"><ArrowLeft size={15} /> Back to home</Link><div className="auth-heading"><span className="auth-kicker">A BETTER SEARCH STARTS HERE</span><h1>Let’s make it yours.</h1><p>Create a free account and meet your best-fit roles.</p></div>
    <form className="auth-form" onSubmit={handleSubmit(submit)} noValidate>
      <label className="form-label" htmlFor="fullName">Full name</label><div className="input-icon-wrap"><UserRound size={17} /><Input id="fullName" autoComplete="name" placeholder="Your name" {...register('fullName')} /></div>{errors.fullName && <span className="field-error">{errors.fullName.message}</span>}
      <label className="form-label" htmlFor="email">Email address</label><div className="input-icon-wrap"><Mail size={17} /><Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} /></div>{errors.email && <span className="field-error">{errors.email.message}</span>}
      <label className="form-label" htmlFor="password">Password</label><div className="input-icon-wrap"><LockKeyhole size={17} /><Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 8 characters" {...register('password')} /><button type="button" className="field-reveal" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>{errors.password && <span className="field-error">{errors.password.message}</span>}
      <Button type="submit" size="lg" className="auth-submit" disabled={isSubmitting}>Create account <ArrowRight size={17} /></Button>
    </form><p className="terms-note">By creating an account, you agree to keep your profile information accurate.</p><p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
  </AuthShell>
}
