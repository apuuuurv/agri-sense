import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';
import { Loader2, CheckCircle, Upload, Tractor, User } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslationText } from '@/hooks/useTranslationText';

export default function ProfileWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslationText();

  // State matching your Backend Model
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
    primary_crops: '',
  });

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/farmers/me');
        setProfile((prev: any) => ({
          ...prev,
          full_name: res.data.full_name || '',
          email: res.data.email || '',
          phone_number: res.data.phone_number || '',
          age: res.data.age?.toString() || '',
          gender: res.data.gender || '',
          category: res.data.category || '',
          state: res.data.state || '',
          district: res.data.district || '',
          annual_income: res.data.annual_income?.toString() || '',
          irrigation_type: res.data.irrigation_type || '',
          land_size_hectares: res.data.land_size_hectares?.toString() || '',
          farmer_type: res.data.farmer_type || '',
          primary_crops: res.data.primary_crops?.join(', ') || '',
        }));
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const updateProfile = async () => {
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
      setStep(3); // Move to uploads
    } catch (err: any) {
      toast.error(t('wizard.toast_fail'));
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    if (!e.target.files?.[0]) return;

    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('doc_type', docType);

    try {
      toast.info(t('common.loading'));
      await api.post('/upload', formData);
      toast.success(t('dashboard.toast_upload_success', { type: docType }));
    } catch (err) {
      toast.error(t('dashboard.toast_upload_failed'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Progress Tracker */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>{t('wizard.step_x_of_y', { current: step, total: 3 })}</span>
            <span>{step === 1 ? t('wizard.step_personal') : step === 2 ? t('wizard.step_farm') : t('wizard.step_verification')}</span>
          </div>
          <Progress value={(step / 3) * 100} className="h-2 bg-emerald-100" />
        </div>

        <Card className="shadow-xl border-none">
          <CardHeader className="bg-emerald-600 text-white rounded-t-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                {step === 1 && <User />}
                {step === 2 && <Tractor />}
                {step === 3 && <Upload />}
                {t('wizard.title')}
              </CardTitle>
              <CardDescription className="text-emerald-100 mt-1">
                {t('wizard.subtitle')}
              </CardDescription>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-lg">
              <LanguageSwitcher />
            </div>
          </CardHeader>

          <CardContent className="pt-8">
            {/* STEP 1: PERSONAL & LOCATION */}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t('form.phone')}</Label>
                  <Input placeholder="+91 ..." value={profile.phone_number} onChange={e => setProfile({ ...profile, phone_number: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t('form.age')}</Label>
                  <Input type="number" value={profile.age} onChange={e => setProfile({ ...profile, age: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t('form.income')}</Label>
                  <Input type="number" placeholder="e.g. 150000" value={profile.annual_income} onChange={e => setProfile({ ...profile, annual_income: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t('form.irrigation')}</Label>
                  <Select value={profile.irrigation_type} onValueChange={v => setProfile({ ...profile, irrigation_type: v })}>
                    <SelectTrigger className="bg-white"><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Rainfed">{t('form.irr_rainfed')}</SelectItem>
                      <SelectItem value="Canal">{t('form.irr_canal')}</SelectItem>
                      <SelectItem value="Borewell">{t('form.irr_borewell')}</SelectItem>
                      <SelectItem value="Drip">{t('form.irr_drip')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('form.state')}</Label>
                  <Input placeholder={t('form.state_placeholder')} value={profile.state} onChange={e => setProfile({ ...profile, state: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t('form.district')}</Label>
                  <Input placeholder={t('form.district_placeholder')} value={profile.district} onChange={e => setProfile({ ...profile, district: e.target.value })} />
                </div>
                <Button className="md:col-span-2 bg-emerald-600" onClick={() => setStep(2)}>{t('wizard.next_farm')}</Button>
              </div>
            )}

            {/* STEP 2: AGRICULTURAL DATA */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>{t('form.category')}</Label>
                  <Select onValueChange={(v) => setProfile({ ...profile, category: v })}>
                    <SelectTrigger><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">{t('form.general')}</SelectItem>
                      <SelectItem value="OBC">{t('form.obc')}</SelectItem>
                      <SelectItem value="SC/ST">{t('form.sc')} / {t('form.st')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('form.land_size')}</Label>
                  <Input type="number" step="0.1" value={profile.land_size_hectares} onChange={e => setProfile({ ...profile, land_size_hectares: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t('form.crops')}</Label>
                  <Input placeholder={t('form.crops_placeholder') || "Wheat, Rice"} value={profile.primary_crops} onChange={e => setProfile({ ...profile, primary_crops: e.target.value })} />
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)}>{t('wizard.back')}</Button>
                  <Button className="flex-1 bg-emerald-600" onClick={updateProfile} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : t('wizard.save_continue')}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: DOCUMENT UPLOAD */}
            {step === 3 && (
              <div className="space-y-8 text-center">
                <div className="grid gap-4">
                  {[t('form.doc_aadhar'), t('form.doc_pan'), t('form.doc_land')].map((doc) => (
                    <div key={doc} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                      <span className="font-medium">{doc}</span>
                      <Input
                        type="file"
                        className="w-auto"
                        onChange={(e) => handleFileUpload(e, doc.toLowerCase().replace(' ', '_'))}
                      />
                    </div>
                  ))}
                </div>
                <Button className="w-full bg-emerald-600 h-12 text-lg" onClick={() => navigate('/dashboard')}>
                  {t('wizard.go_dashboard')} <CheckCircle className="ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}