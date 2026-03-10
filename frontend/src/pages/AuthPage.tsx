import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Leaf } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-emerald-600">
        <CardHeader className="text-center">
          <Leaf className="mx-auto h-10 w-10 text-emerald-600 mb-2" />
          <CardTitle className="text-2xl font-bold">{isLogin ? 'Login' : 'Sign Up'}</CardTitle>
          <CardDescription>Join the AgriSense platform</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input required onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" required onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" required onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full bg-emerald-600" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
            <Button variant="link" type="button" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Need an account? Sign up" : "Have an account? Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}