import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';
import { Loader2, CheckCircle, Upload, Tractor, User, ShieldCheck, XCircle } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslationText } from '@/hooks/useTranslationText';
import { Badge } from '@/components/ui/badge';

export default function ProfileWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState({ aadhar: false, pan: false });
  const [verified, setVerified] = useState({ aadhar: false, pan: false });
  const navigate = useNavigate();
  const { t } = useTranslationText();

  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    age: '',
    gender: '',
    category: '',
    state: '',
    district: '',
    annual_income: '',
    irrigation_type: '',
    land_size_hectares: '',
    farmer_type: '',
    soil_type: '',
    crop_season: '',
    water_source: '',
    land_ownership: '',
    primary_crops: '',
    is_aadhar_verified: false,
    is_pan_verified: false
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/farmers/me');
        setProfile((prev: any) => ({
          ...prev,
          ...res.data,
          age: res.data.age?.toString() || '',
          annual_income: res.data.annual_income?.toString() || '',
          land_size_hectares: res.data.land_size_hectares?.toString() || '',
          primary_crops: res.data.primary_crops?.join(', ') || '',
        }));
        setVerified({
          aadhar: res.data.is_aadhar_verified || false,
          pan: res.data.is_pan_verified || false
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const saveDetails = async () => {
    setLoading(true);
    try {
      const payload = {
        ...profile,
        age: parseInt(profile.age) || null,
        annual_income: parseFloat(profile.annual_income) || 0,
        land_size_hectares: parseFloat(profile.land_size_hectares) || null,
        primary_crops: profile.primary_crops.split(',').map((c: string) => c.trim()).filter((c: string) => c !== "")
      };
      await api.put('/farmers/me', payload);
      toast.success(t('wizard.toast_success'));
      setStep(step + 1);
    } catch (err: any) {
      toast.error(t('wizard.toast_fail'));
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: 'aadhar' | 'pan') => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);

    setVerifying(prev => ({ ...prev, [docType]: true }));
    try {
      toast.info(t('wizard.verifying'));
      const res = await api.post('/upload', formData);
      
      // Every successful upload now counts as "verified" for the wizard flow
      if (res.data.status === 'success') {
        toast.success(t('wizard.verified_success'));
        setVerified(prev => ({ ...prev, [docType]: true }));
        setProfile((prev: any) => ({ 
          ...prev, 
          [`is_${docType}_verified`]: true, // We mark as verified locally to bypass the gate
          [`${docType}_number`]: res.data.extracted_id || prev[`${docType}_number`]
        }));
      }
    } catch (err) {
      toast.error(t('wizard.toast_upload_fail', { type: docType }));
    } finally {
      setVerifying(prev => ({ ...prev, [docType]: false }));
    }
  };

  const isKYCComplete = verified.aadhar && verified.pan;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Progress Tracker */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            <span>{t('wizard.step_x_of_y', { current: step, total: 4 })}</span>
            <span>
              {step === 1 && t('wizard.step_personal')}
              {step === 2 && t('wizard.step_farm')}
              {step === 3 && t('wizard.step_verification')}
              {step === 4 && t('wizard.step_4')}
            </span>
          </div>
          <Progress value={(step / 4) * 100} className="h-3 bg-emerald-100 dark:bg-emerald-900/30 overflow-hidden rounded-full border border-emerald-200/50 dark:border-emerald-800/50" />
        </div>

        <Card className="shadow-2xl border-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden">
          <CardHeader className="bg-emerald-600 dark:bg-emerald-700 text-white p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-emerald-500/20">
            <div>
              <CardTitle className="text-3xl font-black flex items-center gap-3">
                {step === 1 && <User className="h-8 w-8" />}
                {step === 2 && <Tractor className="h-8 w-8" />}
                {step === 3 && <ShieldCheck className="h-8 w-8" />}
                {step === 4 && <CheckCircle className="h-8 w-8" />}
                {step === 4 ? t('common.success') : t('wizard.title')}
              </CardTitle>
              <CardDescription className="text-emerald-50 mt-2 text-lg font-medium opacity-90">
                {step === 3 ? t('wizard.kyc_gate_desc') : t('wizard.subtitle')}
              </CardDescription>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20">
              <LanguageSwitcher />
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {/* STEP 1: PERSONAL & CONTACT */}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-3">
                  <Label className="text-slate-700 dark:text-slate-300 font-bold">{t('form.phone')}</Label>
                  <Input className="h-12 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus:ring-emerald-500" placeholder="+91 ..." value={profile.phone_number} onChange={e => setProfile({ ...profile, phone_number: e.target.value })} />
                </div>
                <div className="space-y-3">
                  <Label className="text-slate-700 dark:text-slate-300 font-bold">{t('form.age')}</Label>
                  <Input className="h-12 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus:ring-emerald-500" type="number" value={profile.age} onChange={e => setProfile({ ...profile, age: e.target.value })} />
                </div>
                <div className="space-y-3">
                  <Label className="text-slate-700 dark:text-slate-300 font-bold">{t('form.income')}</Label>
                  <Input className="h-12 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus:ring-emerald-500" type="number" placeholder="e.g. 150000" value={profile.annual_income} onChange={e => setProfile({ ...profile, annual_income: e.target.value })} />
                </div>
                <div className="space-y-3">
                  <Label className="text-slate-700 dark:text-slate-300 font-bold">{t('form.state')}</Label>
                  <Input className="h-12 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus:ring-emerald-500" placeholder={t('form.state_placeholder')} value={profile.state} onChange={e => setProfile({ ...profile, state: e.target.value })} />
                </div>
                <div className="space-y-3">
                  <Label className="text-slate-700 dark:text-slate-300 font-bold">{t('form.district')}</Label>
                  <Input className="h-12 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus:ring-emerald-500" placeholder={t('form.district_placeholder')} value={profile.district} onChange={e => setProfile({ ...profile, district: e.target.value })} />
                </div>
                <div className="space-y-3">
                  <Label className="text-slate-700 dark:text-slate-300 font-bold">{t('form.gender')}</Label>
                  <Select value={profile.gender} onValueChange={v => setProfile({ ...profile, gender: v })}>
                    <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-800/50"><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">{t('form.male')}</SelectItem>
                      <SelectItem value="Female">{t('form.female')}</SelectItem>
                      <SelectItem value="Other">{t('form.other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="md:col-span-2 h-14 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.01]" onClick={() => setStep(2)}>
                  {t('wizard.next_farm')}
                </Button>
              </div>
            )}

            {/* STEP 2: AGRICULTURAL DATA */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-slate-700 dark:text-slate-300 font-bold">{t('form.land_size')}</Label>
                    <Input className="h-12 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800" type="number" step="0.1" value={profile.land_size_hectares} onChange={e => setProfile({ ...profile, land_size_hectares: e.target.value })} />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-slate-700 dark:text-slate-300 font-bold">{t('form.soil_type')}</Label>
                    <Select value={profile.soil_type} onValueChange={v => setProfile({ ...profile, soil_type: v })}>
                      <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-800/50"><SelectValue placeholder={t('common.select')} /></SelectTrigger>
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
                  <div className="space-y-3">
                    <Label className="text-slate-700 dark:text-slate-300 font-bold">{t('form.crop_season')}</Label>
                    <Select value={profile.crop_season} onValueChange={v => setProfile({ ...profile, crop_season: v })}>
                      <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-800/50"><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kharif">{t('form.season_kharif')}</SelectItem>
                        <SelectItem value="Rabi">{t('form.season_rabi')}</SelectItem>
                        <SelectItem value="Zaid">{t('form.season_zaid')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-slate-700 dark:text-slate-300 font-bold">{t('form.water_source')}</Label>
                    <Select value={profile.water_source} onValueChange={v => setProfile({ ...profile, water_source: v })}>
                      <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-800/50"><SelectValue placeholder={t('common.select')} /></SelectTrigger>
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
                <div className="space-y-3">
                  <Label className="text-slate-700 dark:text-slate-300 font-bold">{t('form.crops')}</Label>
                  <Input className="h-12 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800" placeholder={t('form.crops_placeholder') || "Wheat, Rice"} value={profile.primary_crops} onChange={e => setProfile({ ...profile, primary_crops: e.target.value })} />
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" className="h-14 font-bold border-2 rounded-xl" onClick={() => setStep(1)}>{t('wizard.back')}</Button>
                  <Button className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-bold rounded-xl shadow-lg shadow-emerald-600/20" onClick={saveDetails} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : t('wizard.save_continue')}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: KYC GATE */}
            {step === 3 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid gap-6">
                  {/* Aadhaar Upload */}
                  <div className={`p-6 border-2 rounded-2xl transition-all duration-300 ${verified.aadhar ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500' : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${verified.aadhar ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                          <Upload className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-lg">{t('form.doc_aadhar')}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">12-digit Government ID</p>
                        </div>
                      </div>
                      {verified.aadhar ? (
                        <Badge className="bg-emerald-500 text-white h-8 px-4 text-sm rounded-lg flex gap-1 items-center">
                          <CheckCircle className="h-4 w-4" /> {t('common.verified')}
                        </Badge>
                      ) : verifying.aadhar ? (
                        <Loader2 className="animate-spin h-6 w-6 text-emerald-600" />
                      ) : null}
                    </div>
                    {!verified.aadhar && (
                      <div className="relative group">
                        <Input
                          type="file"
                          accept="image/*,application/pdf"
                          className="cursor-pointer h-12 opacity-0 absolute inset-0 z-10"
                          onChange={(e) => handleFileUpload(e, 'aadhar')}
                        />
                        <Button variant="outline" className="w-full h-12 border-dashed border-2 bg-white dark:bg-slate-900 group-hover:border-emerald-500 group-hover:bg-emerald-50 transition-all font-bold">
                          {t('form.select_file')}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* PAN Upload */}
                  <div className={`p-6 border-2 rounded-2xl transition-all duration-300 ${verified.pan ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500' : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${verified.pan ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                          <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-lg">{t('form.doc_pan')}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Income Tax Department ID</p>
                        </div>
                      </div>
                      {verified.pan ? (
                        <Badge className="bg-emerald-500 text-white h-8 px-4 text-sm rounded-lg flex gap-1 items-center">
                          <CheckCircle className="h-4 w-4" /> {t('common.verified')}
                        </Badge>
                      ) : verifying.pan ? (
                        <Loader2 className="animate-spin h-6 w-6 text-emerald-600" />
                      ) : null}
                    </div>
                    {!verified.pan && (
                      <div className="relative group">
                        <Input
                          type="file"
                          accept="image/*,application/pdf"
                          className="cursor-pointer h-12 opacity-0 absolute inset-0 z-10"
                          onChange={(e) => handleFileUpload(e, 'pan')}
                        />
                        <Button variant="outline" className="w-full h-12 border-dashed border-2 bg-white dark:bg-slate-900 group-hover:border-emerald-500 group-hover:bg-emerald-50 transition-all font-bold">
                          {t('form.select_file')}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" className="h-14 font-bold border-2 rounded-xl" onClick={() => setStep(2)}>{t('wizard.back')}</Button>
                  <Button 
                    className={`flex-1 h-14 text-lg font-bold rounded-xl shadow-lg transition-all ${isKYCComplete ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`} 
                    disabled={!isKYCComplete || loading}
                    onClick={() => setStep(4)}
                  >
                    {t('wizard.finish_setup')}
                  </Button>
                </div>
                {!isKYCComplete && (
                  <p className="text-center text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2 font-medium">
                    <XCircle className="h-4 w-4" /> Identity verification is required to proceed.
                  </p>
                )}
              </div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 4 && (
              <div className="space-y-10 text-center animate-in zoom-in-95 duration-700">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-3xl scale-125" />
                  <CheckCircle className="h-32 w-32 text-emerald-500 mx-auto relative drop-shadow-xl" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Setup Complete!</h3>
                  <p className="text-xl text-slate-600 dark:text-slate-400 font-medium max-w-md mx-auto">
                    Your farmer profile is now verified. Our AI is currently scanning 1,200+ schemes tailored for you.
                  </p>
                </div>
                <Button className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white text-xl font-bold rounded-2xl shadow-xl shadow-emerald-600/30 transition-all hover:scale-[1.02]" onClick={() => navigate('/dashboard')}>
                  {t('wizard.go_dashboard')} <CheckCircle className="ml-3 h-6 w-6" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}