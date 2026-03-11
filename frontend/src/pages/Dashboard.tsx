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
  FileText,
  Sprout,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslationText } from '@/hooks/useTranslationText';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'home' | 'profile'>('home');
  const [farmer, setFarmer] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslationText();

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
    soil_type: '',
    crop_season: '',
    water_source: '',
    land_ownership: '',
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
        soil_type: d.soil_type || '',
        crop_season: d.crop_season || '',
        water_source: d.water_source || '',
        land_ownership: d.land_ownership || '',
        primary_crops: d.primary_crops?.join(', ') || '',
      });
    } catch (err) {
      toast.error(t('auth.toast_fail'));
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
      toast.success(t('dashboard.toast_profile_updated'));
      fetchProfile();
      setActiveTab('home');
    } catch (err) {
      toast.error(t('dashboard.toast_profile_failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentUpload = async () => {
    if (!selectedFile) {
      toast.error(t('dashboard.toast_upload_failed'));
      return;
    }

    setUploadingDoc(true);
    try {
      const docData = new FormData();
      docData.append('file', selectedFile);
      docData.append('doc_type', uploadType);

      const res = await api.post('/upload', docData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { ocr_data } = res.data;
      if (ocr_data && ocr_data.verification_status === "Success") {
        toast.success(t('dashboard.toast_upload_ocr_success', { 
          type: uploadType, 
          id: ocr_data.extracted_id 
        }) || `Verified ${uploadType}: ${ocr_data.extracted_id}`);
      } else {
        toast.success(t('dashboard.toast_upload_success', { type: uploadType }));
      }
      
      setSelectedFile(null);
      const fileInput = document.getElementById('document-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      fetchProfile();
    } catch (err: any) {
      console.error(err);
      toast.error(t('dashboard.toast_upload_failed'));
    } finally {
      setUploadingDoc(false);
    }
  };

  if (!farmer) return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 font-bold text-emerald-600 dark:text-emerald-500">
      <Loader2 className="animate-spin h-8 w-8 mr-3" /> {t('common.loading')}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col md:flex-row overflow-hidden pt-20">

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
            <LayoutDashboard className="mr-2 h-4 w-4" /> {t('dashboard.nav_home')}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start transition-all ${activeTab === 'profile' ? 'bg-emerald-900 dark:bg-emerald-600/20 text-white dark:text-emerald-400' : 'text-emerald-100 dark:text-slate-400 hover:bg-emerald-900 dark:hover:bg-slate-800'}`}
            onClick={() => setActiveTab('profile')}
          >
            <UserCircle className="mr-2 h-4 w-4" /> {t('dashboard.nav_profile')}
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
          <LogOut className="mr-2 h-4 w-4" /> {t('common.logout')}
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
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">{t('dashboard.welcome', { name: farmer.full_name })}</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium italic">{t('dashboard.welcome_sub')}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {farmer.land_size_hectares ? (
                      <Badge className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 px-4 py-1">{t('dashboard.verified_profile')}</Badge>
                    ) : (
                      <Button size="sm" variant="destructive" onClick={() => navigate('/profile-setup')} className="animate-pulse shadow-lg shadow-red-500/20">
                        <AlertCircle className="mr-2 h-4 w-4" /> {t('dashboard.complete_setup')}
                      </Button>
                    )}
                  </div>
                </header>

                {!farmer.land_size_hectares ? (
                  <div className="grid grid-cols-1 gap-6 mb-10">
                    <Card className="border-none shadow-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-8 md:p-12 rounded-[2rem] relative overflow-hidden">
                      <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                        <div className="bg-white/20 p-6 rounded-[2rem] backdrop-blur-md">
                          <Sprout className="h-16 w-16 text-white" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-3xl md:text-4xl font-black mb-4">{t('dashboard.setup_title') || "Let's Get Your Farm Started!"}</h2>
                          <p className="text-emerald-50 text-lg mb-8 max-w-xl opacity-90 leading-relaxed">
                            {t('dashboard.setup_desc') || "Complete your profile to unlock AI-powered scheme recommendations, crop analysis, and government subsidies tailored for your land."}
                          </p>
                          <Button 
                            className="bg-white text-emerald-900 hover:bg-emerald-50 h-14 px-8 text-lg font-bold rounded-2xl shadow-xl transition-all hover:scale-105 group"
                            onClick={() => navigate('/profile-setup')}
                          >
                            {t('dashboard.start_setup') || "Start Profile Setup"}
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                      <Card className="border border-slate-100 dark:border-slate-800 shadow-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm transition-all hover:shadow-lg">
                        <CardContent className="pt-6">
                          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('dashboard.total_land')}</p>
                          <div className="text-3xl font-black mt-1 text-slate-900 dark:text-white">{farmer.land_size_hectares || 0} Ha</div>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" /> {farmer.district || t('dashboard.location_not_set')}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border border-slate-100 dark:border-slate-800 shadow-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm transition-all hover:shadow-lg">
                        <CardContent className="pt-6">
                          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('dashboard.verification')}</p>
                          <div className="text-3xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
                            {farmer.aadhar_number ? t('common.verified') : t('common.pending')}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{t('dashboard.update_to_verify')}</p>
                        </CardContent>
                      </Card>

                      <Card className="border-none shadow-lg bg-emerald-600 dark:bg-emerald-700 text-white shadow-emerald-600/20 transition-all hover:scale-[1.02]">
                        <CardContent className="pt-6">
                          <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest">{t('dashboard.ai_score')}</p>
                          <div className="text-4xl font-black mt-1">82%</div>
                          <div className="flex items-center text-xs mt-2 text-emerald-100">
                            <TrendingUp className="h-3 w-3 mr-1" /> {t('dashboard.new_matches', { count: 4 })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <FileCheck className="text-emerald-600 dark:text-emerald-500" /> {t('dashboard.schemes_title')}
                    </h3>
                    <div className="space-y-4">
                      {farmer.recommended_schemes && farmer.recommended_schemes.length > 0 ? (
                        farmer.recommended_schemes.map((scheme: any, i: number) => (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={scheme.scheme_id}
                            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer hover:shadow-md"
                          >
                            <div className="flex items-center gap-4">
                              <div className="bg-emerald-50 dark:bg-emerald-950/50 p-3 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                {scheme.scheme_id.toString().slice(0, 3).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-slate-900 dark:text-white">{scheme.scheme_name}</h4>
                                  <Badge variant="outline" className="text-[10px] h-5 bg-emerald-50/50 text-emerald-600 border-emerald-200">
                                    {Math.round(scheme.success_probability * 100)}% Match
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{scheme.explanation}</p>
                              </div>
                            </div>
                            <Button variant="ghost" className="rounded-full text-slate-600 dark:text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                              {t('dashboard.apply')} <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-10 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                          <p className="text-slate-500 dark:text-slate-400 italic">{t('dashboard.no_schemes') || "No recommended schemes found. Complete your profile for better matches."}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
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
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('dashboard.profile_title')}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{t('dashboard.profile_desc')}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <Button onClick={handleProfileUpdate} className="bg-emerald-600 hover:bg-emerald-500 text-white w-full md:w-auto shadow-lg shadow-emerald-600/20" disabled={saving}>
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      {t('dashboard.save_all')}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <Card className="border border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white"><User className="h-5 w-5 text-emerald-600 dark:text-emerald-500" /> {t('dashboard.personal_contact')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label className="text-slate-700 dark:text-slate-300">{t('auth.name')}</Label>
                        <Input value={formData.full_name} disabled className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-700 dark:text-slate-300">{t('auth.email')}</Label>
                        <Input value={formData.email} disabled className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-700 dark:text-slate-300">{t('form.phone')}</Label>
                        <Input value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} placeholder="+91..." className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label className="text-slate-700 dark:text-slate-300">{t('form.age')}</Label>
                          <Input type="number" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white" />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-slate-700 dark:text-slate-300">{t('form.gender')}</Label>
                          <Select value={formData.gender} onValueChange={v => setFormData({ ...formData, gender: v })}>
                            <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white"><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">{t('form.male')}</SelectItem>
                              <SelectItem value="Female">{t('form.female')}</SelectItem>
                              <SelectItem value="Other">{t('form.other')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label className="text-slate-700 dark:text-slate-300">{t('form.category')}</Label>
                          <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                            <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white"><SelectValue placeholder={t('form.category')} /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="General">{t('form.general')}</SelectItem>
                              <SelectItem value="OBC">{t('form.obc')}</SelectItem>
                              <SelectItem value="SC">{t('form.sc')}</SelectItem>
                              <SelectItem value="ST">{t('form.st')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-slate-700 dark:text-slate-300">{t('form.diff_abled')}</Label>
                          <Select value={formData.is_differently_abled} onValueChange={v => setFormData({ ...formData, is_differently_abled: v })}>
                            <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white"><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">{t('form.yes')}</SelectItem>
                              <SelectItem value="false">{t('form.no')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white"><MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-500" /> {t('dashboard.location_edu')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label className="text-slate-700 dark:text-slate-300">{t('form.state')}</Label>
                        <Input value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} placeholder={t('form.state_placeholder')} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-700 dark:text-slate-300">{t('form.district')}</Label>
                        <Input value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })} placeholder={t('form.district_placeholder')} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-700 dark:text-slate-300">{t('form.pincode')}</Label>
                        <Input value={formData.pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value })} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300"><GraduationCap className="h-4 w-4" /> {t('form.qualification')}</Label>
                        <Select value={formData.highest_qualification} onValueChange={v => setFormData({ ...formData, highest_qualification: v })}>
                          <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white"><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="None">{t('form.edu_none')}</SelectItem>
                            <SelectItem value="Primary">{t('form.edu_primary')}</SelectItem>
                            <SelectItem value="Secondary">{t('form.edu_secondary')}</SelectItem>
                            <SelectItem value="Higher Secondary">{t('form.edu_higher')}</SelectItem>
                            <SelectItem value="Graduate">{t('form.edu_grad')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white"><CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-500" /> {t('dashboard.identity_fin')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                          {t('form.aadhar')}
                          {farmer.is_aadhar_verified ? (
                            <Badge variant="outline" className="text-[10px] h-5 bg-emerald-50 text-emerald-600 border-emerald-200">
                              {t('dashboard.verified')}
                            </Badge>
                          ) : formData.aadhar_number?.length === 12 && (
                            <Badge variant="outline" className="text-[10px] h-5 bg-amber-50 text-amber-600 border-amber-200">
                              {t('dashboard.unverified')}
                            </Badge>
                          )}
                        </Label>
                        <Input 
                          value={formData.aadhar_number} 
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                            setFormData({ ...formData, aadhar_number: val });
                          }} 
                          placeholder="12-digit number" 
                          className={`bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white ${formData.aadhar_number?.length > 0 && formData.aadhar_number?.length !== 12 ? 'border-red-500 focus-visible:ring-red-500' : ''}`} 
                        />
                        {formData.aadhar_number?.length > 0 && formData.aadhar_number?.length !== 12 && (
                          <p className="text-[10px] text-red-500 mt-[-4px]">Aadhaar must be 12 digits</p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                          {t('form.pan')}
                          {farmer.is_pan_verified ? (
                            <Badge variant="outline" className="text-[10px] h-5 bg-emerald-50 text-emerald-600 border-emerald-200">
                              {t('dashboard.verified')}
                            </Badge>
                          ) : /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.pan_number) && (
                            <Badge variant="outline" className="text-[10px] h-5 bg-amber-50 text-amber-600 border-amber-200">
                              {t('dashboard.unverified')}
                            </Badge>
                          )}
                        </Label>
                        <Input 
                          value={formData.pan_number} 
                          onChange={e => {
                            const val = e.target.value.toUpperCase().slice(0, 10);
                            setFormData({ ...formData, pan_number: val });
                          }} 
                          placeholder="ABCDE1234F" 
                          className={`uppercase bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white ${formData.pan_number?.length > 0 && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.pan_number) ? 'border-red-500 focus-visible:ring-red-500' : ''}`} 
                        />
                        {formData.pan_number?.length > 0 && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.pan_number) && (
                          <p className="text-[10px] text-red-500 mt-[-4px]">Invalid PAN format</p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-700 dark:text-slate-300">{t('form.income')}</Label>
                        <Input type="number" value={formData.annual_income} onChange={e => setFormData({ ...formData, annual_income: e.target.value })} placeholder="e.g. 150000" className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-700 dark:text-slate-300">{t('form.bank_linked')}</Label>
                        <Select value={formData.bank_account_linked} onValueChange={v => setFormData({ ...formData, bank_account_linked: v })}>
                          <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white"><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">{t('form.yes')}</SelectItem>
                            <SelectItem value="false">{t('form.no')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white"><Tractor className="h-5 w-5 text-emerald-600 dark:text-emerald-500" /> {t('dashboard.agri_details')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label className="text-slate-700 dark:text-slate-300">{t('form.land_size')}</Label>
                          <Input type="number" step="0.01" value={formData.land_size_hectares} onChange={e => setFormData({ ...formData, land_size_hectares: e.target.value })} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white" />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-slate-700 dark:text-slate-300">{t('form.farmer_type')}</Label>
                          <Select value={formData.farmer_type} onValueChange={v => setFormData({ ...formData, farmer_type: v })}>
                            <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white"><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Marginal">{t('form.type_marginal')}</SelectItem>
                              <SelectItem value="Small">{t('form.type_small')}</SelectItem>
                              <SelectItem value="Semi-Medium">{t('form.type_semimedium')}</SelectItem>
                              <SelectItem value="Medium">{t('form.type_medium')}</SelectItem>
                              <SelectItem value="Large">{t('form.type_large')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label className="text-slate-700 dark:text-slate-300">{t('form.irrigation')}</Label>
                          <Select value={formData.irrigation_type} onValueChange={v => setFormData({ ...formData, irrigation_type: v })}>
                            <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white"><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Rainfed">{t('form.irr_rainfed')}</SelectItem>
                              <SelectItem value="Canal">{t('form.irr_canal')}</SelectItem>
                              <SelectItem value="Borewell">{t('form.irr_borewell')}</SelectItem>
                              <SelectItem value="Drip">{t('form.irr_drip')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-slate-700 dark:text-slate-300">{t('form.soil_type')}</Label>
                          <Select value={formData.soil_type} onValueChange={v => setFormData({ ...formData, soil_type: v })}>
                            <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white"><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Alluvial">{t('form.soil_alluvial')}</SelectItem>
                              <SelectItem value="Black">{t('form.soil_black')}</SelectItem>
                              <SelectItem value="Red">{t('form.soil_red')}</SelectItem>
                              <SelectItem value="Laterite">{t('form.soil_laterite')}</SelectItem>
                              <SelectItem value="Desert">{t('form.soil_desert')}</SelectItem>
                              <SelectItem value="Mountain">{t('form.soil_mountain')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label className="text-slate-700 dark:text-slate-300">{t('form.crop_season')}</Label>
                          <Select value={formData.crop_season} onValueChange={v => setFormData({ ...formData, crop_season: v })}>
                            <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white"><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Kharif">{t('form.season_kharif')}</SelectItem>
                              <SelectItem value="Rabi">{t('form.season_rabi')}</SelectItem>
                              <SelectItem value="Zaid">{t('form.season_zaid')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-slate-700 dark:text-slate-300">{t('form.water_source')}</Label>
                          <Select value={formData.water_source} onValueChange={v => setFormData({ ...formData, water_source: v })}>
                            <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white"><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Well">{t('form.water_well')}</SelectItem>
                              <SelectItem value="Canal">{t('form.water_canal')}</SelectItem>
                              <SelectItem value="Rain">{t('form.water_rain')}</SelectItem>
                              <SelectItem value="River">{t('form.water_river')}</SelectItem>
                              <SelectItem value="Borewell">{t('form.water_borewell')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label className="text-slate-700 dark:text-slate-300">{t('form.land_ownership')}</Label>
                        <Select value={formData.land_ownership} onValueChange={v => setFormData({ ...formData, land_ownership: v })}>
                          <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:text-white"><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Owned">{t('form.own_owned')}</SelectItem>
                            <SelectItem value="Leased">{t('form.own_leased')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-700 dark:text-slate-300">{t('form.crops')}</Label>
                        <textarea
                          className="flex min-h-[80px] w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
                          placeholder={t('form.crops_placeholder') || "Wheat, Rice... "}
                          value={formData.primary_crops}
                          onChange={e => setFormData({ ...formData, primary_crops: e.target.value })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm md:col-span-2 border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t-4 border-t-emerald-500 dark:border-t-emerald-500">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                        <UploadCloud className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                        {t('dashboard.doc_center')}
                      </CardTitle>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t('dashboard.doc_desc')}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex-1 w-full space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300">{t('form.doc_type')}</Label>
                          <Select value={uploadType} onValueChange={setUploadType}>
                            <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Aadhar">{t('form.doc_aadhar')}</SelectItem>
                              <SelectItem value="PAN">{t('form.doc_pan')}</SelectItem>
                              <SelectItem value="Land_Record">{t('form.doc_land')}</SelectItem>
                              <SelectItem value="Bank_Passbook">{t('form.doc_bank')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1 w-full space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300">{t('form.select_file')}</Label>
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
                          {t('form.upload_btn')}
                        </Button>
                      </div>

                      <div>
                        <Label className="mb-3 block text-slate-700 dark:text-slate-300 font-bold">{t('form.verified_docs')}</Label>
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
                            {t('form.no_docs')}
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
      </main >
    </div >
  );
}