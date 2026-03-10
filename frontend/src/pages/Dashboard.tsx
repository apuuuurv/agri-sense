import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LayoutDashboard, 
  UserCircle, 
  FileCheck, 
  TrendingUp, 
  LogOut,
  ChevronRight,
  AlertCircle,
  Save,
  Loader2,
  MapPin,
  Tractor,
  User,
  CreditCard,
  GraduationCap,
  UploadCloud,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'home' | 'profile'>('home');
  const [farmer, setFarmer] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const [uploadType, setUploadType] = useState('Aadhar');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    age: '',
    gender: '',
    category: '',
    highest_qualification: '',
    is_differently_abled: 'false',
    state: '',
    district: '',
    pincode: '',
    aadhar_number: '',
    pan_number: '',
    annual_income: '',
    bank_account_linked: 'false',
    land_size_hectares: '',
    farmer_type: '',
    irrigation_type: '',
    primary_crops: '',
  });

  const fetchProfile = async () => {
    try {
      const res = await api.get('/farmers/me');
      setFarmer(res.data);
      
      const d = res.data;
      setFormData({
        full_name: d.full_name || '',
        email: d.email || '',
        phone_number: d.phone_number || '',
        age: d.age?.toString() || '',
        gender: d.gender || '',
        category: d.category || '',
        highest_qualification: d.highest_qualification || '',
        is_differently_abled: d.is_differently_abled ? 'true' : 'false',
        state: d.state || '',
        district: d.district || '',
        pincode: d.pincode || '',
        aadhar_number: d.aadhar_number || '',
        pan_number: d.pan_number || '',
        annual_income: d.annual_income?.toString() || '',
        bank_account_linked: d.bank_account_linked ? 'true' : 'false',
        land_size_hectares: d.land_size_hectares?.toString() || '',
        farmer_type: d.farmer_type || '',
        irrigation_type: d.irrigation_type || '',
        primary_crops: d.primary_crops?.join(', ') || '',
      });
    } catch (err) {
      toast.error("Session expired. Please login.");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age) || null,
        annual_income: parseFloat(formData.annual_income) || null,
        land_size_hectares: parseFloat(formData.land_size_hectares) || null,
        is_differently_abled: formData.is_differently_abled === 'true',
        bank_account_linked: formData.bank_account_linked === 'true',
        primary_crops: formData.primary_crops.split(',').map((c: string) => c.trim()).filter((c: string) => c !== ""),
      };
      
      await api.put('/farmers/me', payload);
      toast.success("Profile updated successfully!");
      fetchProfile(); 
      setActiveTab('home');
    } catch (err) {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    setUploadingDoc(true);
    try {
      const docData = new FormData();
      docData.append('file', selectedFile); 
      docData.append('doc_type', uploadType); 

      await api.post('/upload', docData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success(`${uploadType} uploaded successfully!`);
      setSelectedFile(null);
      
      const fileInput = document.getElementById('document-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      fetchProfile(); 
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to upload document. Please check console for details.");
    } finally {
      setUploadingDoc(false);
    }
  };

  if (!farmer) return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 font-bold text-emerald-600 dark:text-emerald-500">
      <Loader2 className="animate-spin h-8 w-8 mr-3" /> Loading AgriSense...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col md:flex-row overflow-hidden">
      
      <aside className="w-full md:w-64 bg-emerald-950 dark:bg-slate-900 text-white p-6 flex flex-col border-r border-emerald-900 dark:border-slate-800 transition-colors duration-300 z-20">
        <div className="flex items-center gap-2 mb-10">
          <LayoutDashboard className="text-emerald-400" />
          <span className="font-black text-xl tracking-tighter">AGRISENSE</span>
        </div>
        <nav className="space-y-2 flex-1">
          <Button 
            variant="ghost" 
            className={`w-full justify-start transition-all ${activeTab === 'home' ? 'bg-emerald-900 dark:bg-emerald-600/20 text-white dark:text-emerald-400' : 'text-emerald-100 dark:text-slate-400 hover:bg-emerald-900 dark:hover:bg-slate-800'}`}
            onClick={() => setActiveTab('home')}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" /> Home
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start transition-all ${activeTab === 'profile' ? 'bg-emerald-900 dark:bg-emerald-600/20 text-white dark:text-emerald-400' : 'text-emerald-100 dark:text-slate-400 hover:bg-emerald-900 dark:hover:bg-slate-800'}`}
            onClick={() => setActiveTab('profile')}
          >
            <UserCircle className="mr-2 h-4 w-4" /> My Profile
          </Button>
        </nav>
        <Button 
          variant="outline" 
          className="mt-4 border-emerald-800 dark:border-slate-700 bg-transparent text-emerald-400 dark:text-slate-300 hover:bg-emerald-900 dark:hover:bg-slate-800 hover:text-emerald-300 dark:hover:text-white transition-all"
          onClick={() => {
            localStorage.removeItem('access_token');
            navigate('/');
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">Welcome, {farmer.full_name}</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium italic">Empowering your farm with AI</p>
                  </div>
                  {farmer.land_size_hectares ? (
                    <Badge className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 px-4 py-1">Verified Profile</Badge>
                  ) : (
                    <Button size="sm" variant="destructive" onClick={() => setActiveTab('profile')} className="animate-pulse shadow-lg shadow-red-500/20">
                      <AlertCircle className="mr-2 h-4 w-4" /> Complete Setup
                    </Button>
                  )}
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <Card className="border border-slate-100 dark:border-slate-800 shadow-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm transition-all hover:shadow-lg">
                    <CardContent className="pt-6">
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Land</p>
                      <div className="text-3xl font-black mt-1 text-slate-900 dark:text-white">{farmer.land_size_hectares || 0} Ha</div>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2 flex items-center">
                          <MapPin className="h-3 w-3 mr-1"/> {farmer.district || 'Location not set'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-100 dark:border-slate-800 shadow-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm transition-all hover:shadow-lg">
                    <CardContent className="pt-6">
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Verification</p>
                      <div className="text-3xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
                        {farmer.aadhar_number ? 'Verified' : 'Pending'}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Update profile to verify</p>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-lg bg-emerald-600 dark:bg-emerald-700 text-white shadow-emerald-600/20 transition-all hover:scale-[1.02]">
                    <CardContent className="pt-6">
                      <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest">AI Match Score</p>
                      <div className="text-4xl font-black mt-1">82%</div>
                      <div className="flex items-center text-xs mt-2 text-emerald-100">
                        <TrendingUp className="h-3 w-3 mr-1" /> 4 New Matches
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <FileCheck className="text-emerald-600 dark:text-emerald-500" /> Eligible Government Schemes
                </h3>
                <div className="space-y-4">
                   {[
                     { name: "PM-Kisan Nidhi", amount: "₹6,000/yr", type: "Direct Transfer", code: "PMK" },
                     { name: "Crop Insurance (PMFBY)", amount: "95% Cover", type: "Insurance", code: "FBY" }
                   ].map((scheme, i) => (
                     <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer hover:shadow-md"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-emerald-50 dark:bg-emerald-950/50 p-3 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            {scheme.code}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">{scheme.name}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{scheme.type} • Benefit: {scheme.amount}</p>
                          </div>
                        </div>
                        <Button variant="ghost" className="rounded-full text-slate-600 dark:text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                          Apply <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                     </motion.div>
                   ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6 pb-12"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Farmer Profile</h1>
                    <p className="text-slate-500 dark:text-slate-400">Ensure your details are accurate for AI scheme matching.</p>
                  </div>
                  <Button onClick={handleProfileUpdate} className="bg-emerald-600 hover:bg-emerald-500 text-white w-full md:w-auto shadow-lg shadow-emerald-600/20" disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save All Changes
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <Card className="border border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white"><User className="h-5 w-5 text-emerald-600 dark:text-emerald-500"/> Personal & Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label className="text-slate-700 dark:text-slate-300">Full Name</Label>
                        <Input value={formData.full_name} disabled className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-700 dark:text-slate-300">Email</Label>
                        <Input value={formData.email} disabled className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-700 dark:text-slate-300">Phone Number</Label>
                        <Input value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} placeholder="+91..." className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label className="text-slate-700 dark:text-slate-300">Age</Label>
                          <Input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white" />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-slate-700 dark:text-slate-300">Gender</Label>
                          <Select value={formData.gender} onValueChange={v => setFormData({...formData, gender: v})}>
                            <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label className="text-slate-700 dark:text-slate-300">Category</Label>
                          <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                            <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white"><SelectValue placeholder="Category" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="General">General</SelectItem>
                              <SelectItem value="OBC">OBC</SelectItem>
                              <SelectItem value="SC">SC</SelectItem>
                              <SelectItem value="ST">ST</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-slate-700 dark:text-slate-300">Differently Abled?</Label>
                          <Select value={formData.is_differently_abled} onValueChange={v => setFormData({...formData, is_differently_abled: v})}>
                            <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white"><MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-500"/> Location & Education</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label className="text-slate-700 dark:text-slate-300">State</Label>
                        <Input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-700 dark:text-slate-300">District</Label>
                        <Input value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-700 dark:text-slate-300">Pincode</Label>
                        <Input value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300"><GraduationCap className="h-4 w-4"/> Highest Qualification</Label>
                        <Select value={formData.highest_qualification} onValueChange={v => setFormData({...formData, highest_qualification: v})}>
                          <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white"><SelectValue placeholder="Select Education Level" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="None">None</SelectItem>
                            <SelectItem value="Primary">Primary School</SelectItem>
                            <SelectItem value="Secondary">Secondary School (10th)</SelectItem>
                            <SelectItem value="Higher Secondary">Higher Secondary (12th)</SelectItem>
                            <SelectItem value="Graduate">Graduate or above</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white"><CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-500"/> Identity & Financials</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label className="text-slate-700 dark:text-slate-300">Aadhar Number</Label>
                        <Input value={formData.aadhar_number} onChange={e => setFormData({...formData, aadhar_number: e.target.value})} placeholder="12-digit number" className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-700 dark:text-slate-300">PAN Number</Label>
                        <Input value={formData.pan_number} onChange={e => setFormData({...formData, pan_number: e.target.value})} placeholder="ABCDE1234F" className="uppercase bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-700 dark:text-slate-300">Annual Income (₹)</Label>
                        <Input type="number" value={formData.annual_income} onChange={e => setFormData({...formData, annual_income: e.target.value})} placeholder="e.g. 150000" className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-700 dark:text-slate-300">Bank Account Linked for DBT?</Label>
                        <Select value={formData.bank_account_linked} onValueChange={v => setFormData({...formData, bank_account_linked: v})}>
                          <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white"><Tractor className="h-5 w-5 text-emerald-600 dark:text-emerald-500"/> Agricultural Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label className="text-slate-700 dark:text-slate-300">Land Size (Hectares)</Label>
                          <Input type="number" step="0.01" value={formData.land_size_hectares} onChange={e => setFormData({...formData, land_size_hectares: e.target.value})} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white" />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-slate-700 dark:text-slate-300">Farmer Type</Label>
                          <Select value={formData.farmer_type} onValueChange={v => setFormData({...formData, farmer_type: v})}>
                            <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white"><SelectValue placeholder="Select Type" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Marginal">Marginal (up to 1 Ha)</SelectItem>
                              <SelectItem value="Small">Small (1-2 Ha)</SelectItem>
                              <SelectItem value="Semi-Medium">Semi-Medium (2-4 Ha)</SelectItem>
                              <SelectItem value="Medium">Medium (4-10 Ha)</SelectItem>
                              <SelectItem value="Large">Large (&gt;10 Ha)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-700 dark:text-slate-300">Irrigation Type</Label>
                        <Select value={formData.irrigation_type} onValueChange={v => setFormData({...formData, irrigation_type: v})}>
                          <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white"><SelectValue placeholder="Select Irrigation" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Rainfed">Rainfed / Unirrigated</SelectItem>
                            <SelectItem value="Canal">Canal</SelectItem>
                            <SelectItem value="Borewell">Borewell / Tube well</SelectItem>
                            <SelectItem value="Drip">Drip / Sprinkler</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-700 dark:text-slate-300">Primary Crops (Comma separated)</Label>
                        <textarea 
                          className="flex min-h-[80px] w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
                          placeholder="Wheat, Rice, Cotton..."
                          value={formData.primary_crops}
                          onChange={e => setFormData({...formData, primary_crops: e.target.value})}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm md:col-span-2 border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t-4 border-t-emerald-500 dark:border-t-emerald-500">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                        <UploadCloud className="h-5 w-5 text-emerald-600 dark:text-emerald-500"/> 
                        Document Center
                      </CardTitle>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Upload your Aadhar, PAN, or Land Records here. (OCR Auto-fill coming soon!)
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex-1 w-full space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300">Document Type</Label>
                          <Select value={uploadType} onValueChange={setUploadType}>
                            <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Aadhar">Aadhar Card</SelectItem>
                              <SelectItem value="PAN">PAN Card</SelectItem>
                              <SelectItem value="Land_Record">Land Record (7/12, etc.)</SelectItem>
                              <SelectItem value="Bank_Passbook">Bank Passbook</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1 w-full space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300">Select File (Image or PDF)</Label>
                          <Input 
                            id="document-upload"
                            type="file" 
                            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white cursor-pointer file:text-emerald-600 dark:file:text-emerald-400" 
                            accept="image/*,.pdf"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} 
                          />
                        </div>
                        <Button 
                          onClick={handleDocumentUpload} 
                          disabled={!selectedFile || uploadingDoc} 
                          className="bg-emerald-600 hover:bg-emerald-500 text-white w-full md:w-auto shadow-md"
                        >
                          {uploadingDoc ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UploadCloud className="h-4 w-4 mr-2" />}
                          Upload File
                        </Button>
                      </div>

                      <div>
                        <Label className="mb-3 block text-slate-700 dark:text-slate-300 font-bold">Verified Documents on File</Label>
                        {farmer?.documents_uploaded?.length > 0 ? (
                          <div className="flex flex-wrap gap-3">
                            {farmer.documents_uploaded.map((docString: string, idx: number) => {
                              const docName = typeof docString === 'string' ? docString.split(':')[0] : 'Document'; 
                              return (
                                <Badge key={idx} variant="outline" className="px-4 py-2 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-400 text-sm">
                                  <FileText className="h-4 w-4" /> 
                                  {docName.replace('_', ' ')}
                                </Badge>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-400 dark:text-slate-500 italic bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 p-4 rounded-lg text-center">
                            No documents uploaded yet.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}