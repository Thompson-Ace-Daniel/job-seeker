import { motion } from 'framer-motion'
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronRight, Compass, Heart, MapPin, Sparkles, Target, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BrandMark } from '../components/common'
import { Button } from '../components/ui'

const roles = [
  { title: 'Product Designer', company: 'Northstar Health', place: 'Remote, US', match: '94%', color: 'purple', icon: '✳' },
  { title: 'Senior Frontend Engineer', company: 'Linear Field', place: 'New York · Hybrid', match: '91%', color: 'blue', icon: 'L' },
]

export function LandingPage() {
  return <div className="landing-page">
    <header className="landing-nav"><Link to="/" className="landing-brand"><BrandMark /></Link><nav className="landing-links"><a href="#how-it-works">How it works</a><a href="#why-jobrec">Why JobRec</a></nav><div className="landing-actions"><Link to="/login" className="nav-signin">Sign in</Link><Link to="/register"><Button size="sm" className="nav-cta">Create account <ArrowUpRight size={15} /></Button></Link></div></header>
    <main>
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <div className="hero-pill"><span className="sparkle-dot"><Sparkles size={12} /></span> A more personal way to job search</div>
          <h1>Your next role<br />should <span>feel like you.</span></h1>
          <p className="hero-description">Meet opportunities that fit your skills, your ambitions, and the way you want to work. Less scrolling. More possibility.</p>
          <div className="hero-actions"><Link to="/register"><Button size="lg">Find your next role <ArrowRight size={17} /></Button></Link><a href="#how-it-works" className="text-link">See how it works <ArrowDown size={15} /></a></div>
          <div className="hero-trust"><span className="trust-check"><Check size={12} /></span> Free to use<span className="dot-separator">·</span><span className="trust-check"><Check size={12} /></span> Your data stays on your device</div>
        </div>
        <div className="hero-visual" aria-label="Example job matches">
          <div className="hero-visual-grid" />
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <motion.div className="match-float float-top" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}><span className="float-icon"><Target size={17} /></span><div><strong>Your fit, in focus</strong><small>Every match has a reason</small></div></motion.div>
          <div className="floating-emoji emoji-one">✦</div><div className="floating-emoji emoji-two">↗</div>
          <div className="job-preview-stack">{roles.map((role, index) => <motion.article className={`preview-card preview-${role.color}`} key={role.title} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + index * 0.14, duration: 0.48 }}>
            <div className="preview-top"><div className={`preview-logo logo-${role.color}`}>{role.icon}</div><span className="preview-match"><Sparkles size={11} /> {role.match} fit</span></div><h3>{role.title}</h3><div className="preview-company">{role.company}<span>·</span><MapPin size={12} />{role.place}</div><div className="preview-divider" /><div className="preview-skills"><span>React</span><span>Product sense</span><span>+2</span></div>
          </motion.article>)}</div>
          <div className="match-float float-bottom"><span className="float-icon float-icon-green"><TrendingUp size={16} /></span><div><strong>Skills first</strong><small>Not just a job title</small></div></div>
        </div>
        <a className="scroll-cue" href="#how-it-works"><span />SCROLL TO EXPLORE</a>
      </section>
      <section id="how-it-works" className="how-section"><div className="section-overline"><span /> A BETTER STARTING POINT</div><div className="how-heading"><h2>A search that starts<br />with <span>you.</span></h2><p>JobRec brings your experience, interests, and work style together to make finding your next opportunity feel a little more human.</p></div><div className="steps-grid">
        <article className="step-card"><div className="step-number">01</div><span className="step-icon step-icon-indigo"><Compass size={21} /></span><h3>Tell us what matters</h3><p>Add your skills, experience, and the kind of work you want to do next.</p><div className="step-line" /></article>
        <article className="step-card"><div className="step-number">02</div><span className="step-icon step-icon-mint"><Sparkles size={21} /></span><h3>See your best fits</h3><p>Our matching engine connects your profile to jobs that make sense for you.</p><div className="step-line" /></article>
        <article className="step-card"><div className="step-number">03</div><span className="step-icon step-icon-peach"><Heart size={21} /></span><h3>Make your next move</h3><p>Explore real opportunities, apply with confidence, and keep your search in one place.</p></article>
      </div><Link to="/register" className="how-cta">Start exploring <ChevronRight size={16} /></Link></section>
      <section id="why-jobrec" className="bottom-cta"><div className="cta-stars">✦</div><div><span className="section-overline">A LITTLE MORE YOU IN EVERY SEARCH</span><h2>Ready to find your kind of work?</h2><p>Your next chapter is closer than you think.</p></div><Link to="/register"><Button size="lg" variant="secondary">Create your free profile <ArrowRight size={17} /></Button></Link></section>
    </main>
    <footer className="landing-footer"><BrandMark /><span>Made for the work you want to do.</span><span>© 2026 JobRec AI</span></footer>
  </div>
}
