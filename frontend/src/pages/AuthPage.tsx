import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Leaf, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const loginData = new FormData();
        loginData.append('username', formData.email);
        loginData.append('password', formData.password);
        const res = await api.post('/auth/login', loginData);
        localStorage.setItem('access_token', res.data.access_token);
        toast.success("Welcome back!");
        navigate('/dashboard'); 
      } else {
        await api.post('/auth/signup', formData);
        toast.success("Account created! Logging you in...");
        setIsLogin(true);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Auth failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 p-4 transition-colors duration-300 relative overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-500/20 rounded-full blur-[120px] pointer-events-none" />

      <Link to="/" className="absolute top-6 left-6 z-10">
        <Button variant="ghost" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <Card className="shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200 dark:border-slate-800 border-t-4 border-t-emerald-500 rounded-2xl overflow-hidden transition-all duration-300">
          <CardHeader className="text-center pt-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Leaf className="mx-auto h-12 w-12 text-emerald-500 mb-4 drop-shadow-md" />
            </motion.div>
            <CardTitle className="text-3xl font-black tracking-tight">{isLogin ? 'Welcome Back' : 'Create Account'}</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-base mt-2">
              Join the AgriSense platform
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 pb-8 px-8">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2"
                >
                  <Label className="text-slate-700 dark:text-slate-300 font-semibold">Full Name</Label>
                  <Input 
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 h-12"
                    required 
                    onChange={e => setFormData({...formData, full_name: e.target.value})} 
                  />
                </motion.div>
              )}
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300 font-semibold">Email</Label>
                <Input 
                  type="email" 
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 h-12"
                  required 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300 font-semibold">Password</Label>
                <Input 
                  type="password" 
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 h-12"
                  required 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 px-8 pb-8 bg-slate-50/50 dark:bg-slate-950/50 pt-6 border-t border-slate-100 dark:border-slate-800/50">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-12 text-lg font-bold shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]" disabled={loading}>
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>
              <Button variant="ghost" type="button" onClick={() => setIsLogin(!isLogin)} className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium w-full">
                {isLogin ? "Need an account? Sign up" : "Have an account? Login"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}