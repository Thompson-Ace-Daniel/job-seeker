import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { motion } from 'framer-motion'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'; size?: 'sm' | 'md' | 'lg'; icon?: ReactNode }
export function Button({ variant = 'primary', size = 'md', icon, className = '', children, ...props }: ButtonProps) {
  return <button className={`inline-flex items-center justify-center gap-2 button button-${variant} button-${size} ${className}`} {...props}>{icon}{children}</button>
}
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className = '', ...props }, ref) { return <input {...props} ref={ref} className={`field ${className}`} /> })
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className = '', ...props }, ref) { return <textarea {...props} ref={ref} className={`field field-textarea ${className}`} /> })
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) { return <section className={`card ${className}`}>{children}</section> }
export function Badge({ children, tone = 'neutral', className = '' }: { children: ReactNode; tone?: 'neutral' | 'brand' | 'green' | 'amber' | 'red'; className?: string }) { return <span className={`badge badge-${tone} ${className}`}>{children}</span> }
export function PageIntro({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="page-intro"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div className="page-action">{action}</div>}</div>
}
export function Animated({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return <motion.div className={className} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut', delay }}>{children}</motion.div>
}
export function Skeleton({ className = '' }: { className?: string }) { return <div className={`skeleton ${className}`} aria-hidden="true" /> }
