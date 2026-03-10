import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence, cubicBezier } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Leaf, ShieldCheck, Zap, Search, ArrowRight, CheckCircle2,
  Globe, Sprout, BarChart3, FileText, Sun, Moon, Star,
  ChevronDown, Twitter, Linkedin, Github, Bell,
  Database, ClipboardList, TrendingUp, Users, Award, Lock
} from 'lucide-react';

import DarkVeil from '@/components/DarkVeil';
import { useTheme } from '@/components/theme-provider';

// ─── DATA ──────────────────────────────────────────────────────────────────────

const features = [
  {
    title: "AI Scheme Matching",
    description: "Proprietary engine cross-references your profile with 1,200+ State & Central schemes in real-time.",
    icon: <Zap className="h-5 w-5" />,
    accent: "emerald",
  },
  {
    title: "Digital Document Vault",
    description: "AES-256 encrypted storage for land records, Aadhar, and certificates. Upload once, apply forever.",
    icon: <Lock className="h-5 w-5" />,
    accent: "blue",
  },
  {
    title: "Subsidy Analytics",
    description: "Track disbursement cycles with predictive alerts on upcoming agricultural grants.",
    icon: <BarChart3 className="h-5 w-5" />,
    accent: "amber",
  },
  {
    title: "Auto Application Filing",
    description: "Submit verified documents to government portals automatically — no manual form filling.",
    icon: <ClipboardList className="h-5 w-5" />,
    accent: "violet",
  },
  {
    title: "Live Scheme Database",
    description: "Real-time sync with PM-Kisan, state portals, and district-level agricultural boards.",
    icon: <Database className="h-5 w-5" />,
    accent: "teal",
  },
  {
    title: "Smart Eligibility Detection",
    description: "Machine-learning model trained on 5M+ farmer profiles to surface hidden eligibility.",
    icon: <Search className="h-5 w-5" />,
    accent: "rose",
  },
];

const accentMap = {
  emerald: { bg: "bg-emerald-500/10 dark:bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400", border: "group-hover:border-emerald-500/40" },
  blue: { bg: "bg-blue-500/10 dark:bg-blue-500/15", text: "text-blue-600 dark:text-blue-400", border: "group-hover:border-blue-500/40" },
  amber: { bg: "bg-amber-500/10 dark:bg-amber-500/15", text: "text-amber-600 dark:text-amber-400", border: "group-hover:border-amber-500/40" },
  violet: { bg: "bg-violet-500/10 dark:bg-violet-500/15", text: "text-violet-600 dark:text-violet-400", border: "group-hover:border-violet-500/40" },
  teal: { bg: "bg-teal-500/10 dark:bg-teal-500/15", text: "text-teal-600 dark:text-teal-400", border: "group-hover:border-teal-500/40" },
  rose: { bg: "bg-rose-500/10 dark:bg-rose-500/15", text: "text-rose-600 dark:text-rose-400", border: "group-hover:border-rose-500/40" },
};

const stats = [
  { value: 10000, suffix: "+", label: "Farmers Supported", icon: <Users className="h-5 w-5" /> },
  { value: 1200, suffix: "+", label: "Government Schemes", icon: <Database className="h-5 w-5" /> },
  { value: 50, prefix: "₹", suffix: "Cr+", label: "Subsidies Tracked", icon: <TrendingUp className="h-5 w-5" /> },
  { value: 95, suffix: "%", label: "Matching Accuracy", icon: <Award className="h-5 w-5" /> },
];

const testimonials = [
  {
    name: "Ramesh Patil",
    state: "Maharashtra",
    role: "Sugarcane Farmer, 8 acres",
    quote: "I had no idea I qualified for three separate schemes. AgriSense found them in minutes and auto-filed my application. I received ₹42,000 in subsidies I would have completely missed.",
    avatar: "RP",
    color: "from-emerald-500 to-teal-600",
  },
  {
    name: "Kavitha Devi",
    state: "Tamil Nadu",
    role: "Rice Cultivator, 4 acres",
    quote: "The document vault is a game-changer. I uploaded my Patta once and AgriSense handled applications to five different departments automatically. Truly effortless.",
    avatar: "KD",
    color: "from-blue-500 to-indigo-600",
  },
  {
    name: "Gurpreet Singh",
    state: "Punjab",
    role: "Wheat & Maize Farmer, 15 acres",
    quote: "The predictive alerts told me about the PM-KUSUM scheme two months before my neighbours heard about it. I was first in line and got approved quickly.",
    avatar: "GS",
    color: "from-amber-500 to-orange-600",
  },
];

const faqs = [
  {
    q: "How does AgriSense find the right government schemes for me?",
    a: "Our AI engine analyses your farmer profile — including land size, crop type, state, income, and social category — and cross-references it against a live database of 1,200+ Central and State government schemes. The matching algorithm is trained on millions of real eligibility cases to maximise accuracy.",
  },
  {
    q: "Is my personal and land data secure?",
    a: "Absolutely. All documents are encrypted at rest using AES-256 and in transit via TLS 1.3. We are compliant with India's DPDP Act 2023 and never share your data with third parties without explicit consent.",
  },
  {
    q: "Do I need technical knowledge to use the platform?",
    a: "Not at all. AgriSense is designed for farmers who may be using smartphones for the first time. The interface supports Hindi and 12 regional languages, and our onboarding takes under 5 minutes.",
  },
  {
    q: "Which government schemes are supported?",
    a: "We cover PM-Kisan, PM-KUSUM, PMFBY, Soil Health Card scheme, e-NAM, KCC (Kisan Credit Card), PMKSY, RKVY, and hundreds of state-level schemes across all 28 states and 8 UTs.",
  },
  {
    q: "Is AgriSense free to use?",
    a: "The basic plan — profile creation, scheme matching, and eligibility reports — is completely free. Premium features like automated application filing, priority document processing, and subsidiy tracking dashboards are available on affordable paid plans.",
  },
  {
    q: "How long does scheme matching take?",
    a: "Instant. Once your profile is complete, our AI delivers your personalised scheme list in under 10 seconds. Application filing to government portals typically completes within 24–48 hours depending on portal availability.",
  },
];

const steps = [
  { num: "01", title: "Create Farmer Profile", desc: "Enter your land details, crop type, state, and social category in under 5 minutes.", icon: <FileText className="h-5 w-5" /> },
  { num: "02", title: "AI Finds Eligible Schemes", desc: "Our engine scans 1,200+ Central and State schemes and ranks your best matches.", icon: <Search className="h-5 w-5" /> },
  { num: "03", title: "Upload Your Documents", desc: "Securely store Aadhar, land records, and bank details in your encrypted vault.", icon: <ShieldCheck className="h-5 w-5" /> },
  { num: "04", title: "Apply Instantly", desc: "One click auto-submits to all eligible government portals on your behalf.", icon: <CheckCircle2 className="h-5 w-5" /> },
];

const benefits = [
  { title: "Never Miss a Scheme", desc: "Real-time alerts when new schemes matching your profile go live.", icon: <Bell className="h-6 w-6" /> },
  { title: "Save Hours on Paperwork", desc: "Automated form filling eliminates repetitive government applications.", icon: <FileText className="h-6 w-6" /> },
  { title: "Central + State in One Place", desc: "No more switching between multiple government portals.", icon: <Globe className="h-6 w-6" /> },
  { title: "Track Every Rupee", desc: "Full disbursement history and pending amount dashboards.", icon: <TrendingUp className="h-6 w-6" /> },
];

// ─── ANIMATIONS ────────────────────────────────────────────────────────────────

const easeCustom = cubicBezier(0.22, 1, 0.36, 1);

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeCustom } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

// ─── COUNTER ───────────────────────────────────────────────────────────────────

function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString('en-IN')}{suffix}
    </span>
  );
}

// ─── FAQ ITEM ──────────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      variants={fadeUp}
      className={`border-b border-slate-200 dark:border-slate-800 transition-colors ${open ? "" : "hover:border-emerald-300 dark:hover:border-emerald-700"}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
      >
        <span className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {q}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-slate-500 dark:text-slate-400 leading-relaxed text-sm">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060a0f] font-sans text-slate-900 dark:text-slate-50 overflow-x-hidden transition-colors duration-300">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 w-full z-50 px-4 pt-4">
        <motion.div
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: easeCustom }}
          className="max-w-7xl mx-auto flex items-center justify-between px-5 py-3 bg-transparent backdrop-blur-md"
        >
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-1.5 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/25">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-[-0.04em] text-emerald-900 dark:text-white">
              AGRISENSE
            </span>
          </div>

          <div className="hidden md:flex gap-7 text-sm font-medium text-slate-600 dark:text-slate-400">
            {["Features", "Process", "Testimonials", "FAQ"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-xl"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Link to="/auth">
              <Button variant="ghost" className="h-9 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-white/8 rounded-xl">
                Login
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="h-9 px-5 text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 hover:shadow-emerald-500/40">
                Get Started
              </Button>
            </Link>
          </div>
        </motion.div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative w-full min-h-screen flex items-center justify-center px-6 pt-28 pb-20 overflow-hidden">

        {theme === "dark" && (
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 opacity-90 bg-[#060a0f]">
              <DarkVeil
                hueShift={0}
                noiseIntensity={0}
                scanlineIntensity={0.05}
                speed={1.5}
                scanlineFrequency={5}
                warpAmount={0}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#060a0f]/30 to-[#060a0f]" />
            {/* Glow orbs */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />
          </div>
        )}

        {theme === "light" && (
          <div className="absolute inset-0 z-0 bg-white">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.12),transparent)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-white via-emerald-50/40 to-slate-50" />
          </div>
        )}

        {/* Grid texture */}
        <div className="absolute inset-0 z-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#10b981 1px,transparent 1px),linear-gradient(90deg,#10b981 1px,transparent 1px)", backgroundSize: "60px 60px" }} />

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          <motion.div variants={fadeUp} className="mb-7">
            <Badge className="px-4 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300/40 dark:border-emerald-500/30 text-xs font-semibold backdrop-blur-md">
              <Sprout className="h-3.5 w-3.5 mr-1.5 inline-block" />
              NEW: 2026 PM-Kisan Integration Live
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-[-0.04em] text-slate-900 dark:text-white mb-7 leading-[1.05]"
          >
            Harvest the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 italic">
              Benefits
            </span>
            <br />
            You Deserve.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Stop missing government support. Our AI scans thousands of Central and State schemes to find and file the perfect match for your farm — automatically.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-14">
            <Link to="/auth">
              <Button className="h-13 px-8 py-4 text-base bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl group transition-all shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:scale-105">
                Check Eligibility Free
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" className="h-13 px-8 py-4 text-base font-semibold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-400 dark:hover:border-emerald-600 rounded-xl bg-transparent">
              Watch Demo
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-sm text-slate-500 dark:text-slate-500">
            {[
              { icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />, text: "Bank-grade encryption" },
              { icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, text: "No credit card required" },
              { icon: <Users className="h-4 w-4 text-emerald-500" />, text: "10,000+ farmers trust us" },
            ].map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {item.icon}
                {item.text}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 px-6 bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-800/60">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((s, i) => (
              <motion.div key={i} variants={fadeUp} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                    {s.icon}
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
                  <AnimatedCounter target={s.value} suffix={s.suffix} prefix={s.prefix} />
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-500 font-medium">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-28 px-6 bg-slate-50 dark:bg-[#060a0f]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp}>
              <Badge className="mb-4 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-xs font-semibold rounded-full">
                Platform Features
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black tracking-[-0.03em] text-slate-900 dark:text-white mb-4">
              Everything Your Farm Needs
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Six powerful tools built into one platform, designed specifically for Indian farmers navigating complex government programmes.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((f, idx) => {
              const accent = accentMap[f.accent as keyof typeof accentMap];
              return (
                <motion.div key={idx} variants={fadeUp}>
                  <Card className={`group h-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-none hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-black/40 hover:-translate-y-1.5 transition-all duration-400 rounded-2xl overflow-hidden ${accent.border}`}>
                    <CardHeader className="pb-3">
                      <div className={`${accent.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${accent.text} group-hover:scale-110 transition-transform duration-400`}>
                        {f.icon}
                      </div>
                      <CardTitle className={`text-lg font-bold tracking-tight text-slate-900 dark:text-white`}>{f.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                        {f.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="process" className="py-28 px-6 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp}>
              <Badge className="mb-4 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-xs font-semibold rounded-full">
                How It Works
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black tracking-[-0.03em] text-slate-900 dark:text-white mb-4">
              From Profile to Payment <br className="hidden md:block" />in Four Steps.
            </motion.h2>
          </motion.div>

          <div className="relative">
            {/* Connector line */}
            <div className="absolute top-10 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] hidden lg:block h-px bg-gradient-to-r from-transparent via-emerald-300/60 dark:via-emerald-700/40 to-transparent" />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {steps.map((step, i) => (
                <motion.div key={i} variants={fadeUp} className="relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-5">
                      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 border border-emerald-200/60 dark:border-emerald-700/30 flex items-center justify-center shadow-sm">
                        <span className="text-emerald-600 dark:text-emerald-400">{step.icon}</span>
                      </div>
                      <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center">
                        <span className="text-white text-[10px] font-black">{i + 1}</span>
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-base">{step.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="py-28 px-6 bg-slate-50 dark:bg-[#060a0f]">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: easeCustom }}
            >
              <Badge className="mb-5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-xs font-semibold rounded-full">
                Why AgriSense
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em] text-slate-900 dark:text-white mb-6 leading-tight">
                Built to Give Farmers an Unfair Advantage.
              </h2>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                The average farmer misses out on ₹18,000+ in unclaimed government benefits each year — not because they don't qualify, but because the system is too complex. AgriSense fixes that.
              </p>
              <Link to="/auth">
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">
                  Start for Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid sm:grid-cols-2 gap-4"
            >
              {benefits.map((b, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <div className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors group">
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400 w-fit mb-4 group-hover:scale-110 transition-transform">
                      {b.icon}
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 text-sm">{b.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{b.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-28 px-6 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp}>
              <Badge className="mb-4 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-xs font-semibold rounded-full">
                Testimonials
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black tracking-[-0.03em] text-slate-900 dark:text-white mb-4">
              Farmers Who Got What They Deserved
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div className="h-full p-7 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-xl hover:shadow-slate-100/80 dark:hover:shadow-black/30 hover:-translate-y-1 transition-all duration-400 flex flex-col">
                  <div className="flex mb-4 gap-0.5">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm mb-6 flex-1">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-black shrink-0`}>
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-500">{t.role} · {t.state}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-28 px-6 bg-slate-50 dark:bg-[#060a0f]">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.div variants={fadeUp}>
              <Badge className="mb-4 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-xs font-semibold rounded-full">
                FAQ
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl font-black tracking-[-0.03em] text-slate-900 dark:text-white">
              Common Questions
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="divide-y divide-slate-200 dark:divide-slate-800"
          >
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-28 px-6 bg-white dark:bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: easeCustom }}
            className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 p-12 md:p-20 text-center shadow-2xl"
          >
            {/* Decorative glows */}
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-400/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-teal-400/10 blur-3xl rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <Badge className="mb-6 px-3 py-1 bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs font-semibold rounded-full">
                Free to Start
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em] text-white mb-5 leading-tight">
                Start Finding Your <br />Government Benefits Today
              </h2>
              <p className="text-emerald-200/70 mb-10 max-w-lg mx-auto leading-relaxed">
                Join 10,000+ farmers who have already claimed ₹50Cr+ in government subsidies. No paperwork, no confusion — just results.
              </p>
              <Link to="/auth">
                <Button className="h-14 px-10 text-base bg-white hover:bg-emerald-50 text-emerald-900 font-bold rounded-2xl shadow-xl hover:scale-105 transition-all group">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-16 px-6 border-t border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#060a0f]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-5">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-1.5 rounded-xl shadow-lg shadow-emerald-500/20">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
                <span className="font-black text-lg tracking-[-0.04em] text-emerald-900 dark:text-white">
                  AGRISENSE
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-500 text-sm leading-relaxed max-w-xs">
                Bridging technology and tradition to ensure every Indian farmer receives the government support they deserve.
              </p>
              <div className="flex gap-3 mt-6">
                {[Twitter, Linkedin, Github].map((Icon, i) => (
                  <a key={i} href="#" className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {[
              { title: "Platform", links: ["Scheme Finder", "Document Vault", "Analytics", "Applications"] },
              { title: "Company", links: ["About Us", "Blog", "Careers", "Press"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "DPDP Act"] },
            ].map((col, i) => (
              <div key={i}>
                <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-4">{col.title}</h5>
                <ul className="space-y-3">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-sm text-slate-500 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800/60 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-400 dark:text-slate-600">
              © 2026 AgriSense Technologies Pvt. Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-600">
              <Globe className="h-3.5 w-3.5" />
              Available in 12 Indian languages
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}