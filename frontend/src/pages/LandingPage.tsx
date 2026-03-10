import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Leaf, 
  ShieldCheck, 
  Zap, 
  Search, 
  ArrowRight, 
  CheckCircle2,
  Globe,
  Sprout,
  BarChart3,
  FileText
} from 'lucide-react';

const features = [
  {
    title: "AI Scheme Matching",
    description: "Our proprietary engine cross-references your profile with over 1,200 State & Central schemes.",
    icon: <Zap className="h-6 w-6 text-emerald-400" />,
    color: "bg-emerald-500/10",
  },
  {
    title: "Digital Document Vault",
    description: "AES-256 encrypted storage for land records, Aadhar, and certificates. Upload once, apply forever.",
    icon: <ShieldCheck className="h-6 w-6 text-blue-400" />,
    color: "bg-blue-500/10",
  },
  {
    title: "Subsidy Analytics",
    description: "Track disbursement cycles and get predictive alerts on upcoming agricultural grants.",
    icon: <BarChart3 className="h-6 w-6 text-amber-400" />,
    color: "bg-amber-500/10",
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      {/* --- PREMIUM GLASS NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-emerald-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-emerald-900">AGRISENSE</span>
          </div>
          
          <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">Process</a>
            <a href="#about" className="hover:text-emerald-600 transition-colors">About</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" className="font-bold text-slate-700">Login</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 shadow-lg shadow-emerald-200">
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-44 pb-32 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-emerald-50 to-transparent -z-10" />
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mb-8 animate-bounce">
            <Sprout className="h-4 w-4" /> NEW: 2026 PM-Kisan Integration Live
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-[0.9]">
            Harvest the <span className="text-emerald-600 italic">Benefits</span> You Deserve.
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-3xl mx-auto leading-relaxed">
            Stop missing out on government support. Our AI scans thousands of schemes to find the perfect match for your farm.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/auth">
              <Button className="h-16 px-10 text-lg bg-slate-900 hover:bg-slate-800 text-white rounded-2xl group">
                Check Eligibility <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <div className="flex -space-x-3 items-center justify-center">
               {[1,2,3,4].map(i => (
                 <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold">U{i}</div>
               ))}
               <p className="pl-6 text-sm font-medium text-slate-500">Trusted by 10k+ Farmers</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- BENTO BOX FEATURES --- */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="group relative p-8 rounded-3xl border bg-white hover:border-emerald-500/50 hover:shadow-2xl transition-all duration-500">
              <div className={`${feature.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed text-lg">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- MODERN HOW IT WORKS --- */}
      <section id="how-it-works" className="py-24 px-6 bg-emerald-950 rounded-[3rem] mx-4 my-12 text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-emerald-900/50 skew-x-12 translate-x-32" />
        <div className="max-w-6xl mx-auto relative z-10 grid md:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-5xl font-black mb-12 leading-tight">A Simple Path to <br/><span className="text-emerald-400">Financial Growth.</span></h2>
            <div className="space-y-12">
              {[
                { step: "01", title: "Complete Profile", text: "Securely input your land size, soil type, and location details.", icon: <FileText/> },
                { step: "02", title: "Instant AI Match", text: "Our algorithm filters state and central databases in real-time.", icon: <Search/> },
                { step: "03", title: "Direct Application", text: "Submit your verified documents to government portals automatically.", icon: <CheckCircle2/> }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="h-14 w-14 rounded-full border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                    <p className="text-emerald-100/60 leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
             <div className="absolute -inset-4 bg-emerald-500/20 blur-3xl rounded-full" />
             <div className="relative bg-white/10 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] shadow-2xl">
                <div className="space-y-4">
                   <div className="h-2 w-24 bg-emerald-500 rounded-full" />
                   <div className="h-32 w-full bg-white/5 rounded-xl animate-pulse" />
                   <div className="grid grid-cols-2 gap-4">
                      <div className="h-20 bg-white/5 rounded-xl" />
                      <div className="h-20 bg-white/5 rounded-xl" />
                   </div>
                   <div className="h-12 w-full bg-emerald-600 rounded-xl" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 border-t pt-12">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 mb-6">
              <Leaf className="h-6 w-6 text-emerald-600" />
              <span className="font-black text-xl tracking-tighter">AGRISENSE</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Bridging the gap between technology and tradition to ensure every farmer gets the support they deserve.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
             <div className="flex flex-col gap-4">
                <h5 className="font-bold">Platform</h5>
                <a href="#" className="text-slate-500 hover:text-emerald-600">Schemes</a>
                <a href="#" className="text-slate-500 hover:text-emerald-600">Tracking</a>
             </div>
             <div className="flex flex-col gap-4">
                <h5 className="font-bold">Company</h5>
                <a href="#" className="text-slate-500 hover:text-emerald-600">Privacy</a>
                <a href="#" className="text-slate-500 hover:text-emerald-600">Contact</a>
             </div>
             <div className="flex gap-4 pt-1">
                <Globe className="h-5 w-5 text-slate-400 cursor-pointer hover:text-emerald-600" />
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}