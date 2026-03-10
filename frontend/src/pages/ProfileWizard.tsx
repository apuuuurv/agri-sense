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
import { Loader2, CheckCircle, Upload, MapPin, Tractor, User } from 'lucide-react';

export default function ProfileWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // State matching your Backend Model
  const [profile, setProfile] = useState({
    phone_number: '',
    age: '',
    gender: '',
    category: '',
    state: '',
    district: '',
    land_size_hectares: '',
    farmer_type: '',
    primary_crops: '',
  });

  const updateProfile = async () => {
    setLoading(true);
    try {
      await api.put('/farmers/me', {
        ...profile,
        age: parseInt(profile.age),
        land_size_hectares: parseFloat(profile.land_size_hectares),
        primary_crops: profile.primary_crops.split(',').map(c => c.trim())
      });
      toast.success("Profile details saved!");
      setStep(3); // Move to uploads
    } catch (err: any) {
      toast.error("Failed to save details");
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
      toast.info(`Uploading ${docType}...`);
      await api.post('/upload/', formData);
      toast.success(`${docType} uploaded successfully!`);
    } catch (err) {
      toast.error(`Upload failed for ${docType}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Progress Tracker */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Step {step} of 3</span>
            <span>{step === 1 ? 'Personal info' : step === 2 ? 'Farm Details' : 'Verification'}</span>
          </div>
          <Progress value={(step / 3) * 100} className="h-2 bg-emerald-100" />
        </div>

        <Card className="shadow-xl border-none">
          <CardHeader className="bg-emerald-600 text-white rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              {step === 1 && <User />}
              {step === 2 && <Tractor />}
              {step === 3 && <Upload />}
              Complete Your Farmer Profile
            </CardTitle>
            <CardDescription className="text-emerald-100">
              This information helps our AI find the best schemes for you.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-8">
            {/* STEP 1: PERSONAL & LOCATION */}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input placeholder="+91 ..." value={profile.phone_number} onChange={e => setProfile({...profile, phone_number: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input type="number" value={profile.age} onChange={e => setProfile({...profile, age: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input placeholder="e.g. Maharashtra" value={profile.state} onChange={e => setProfile({...profile, state: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>District</Label>
                  <Input placeholder="e.g. Pune" value={profile.district} onChange={e => setProfile({...profile, district: e.target.value})} />
                </div>
                <Button className="md:col-span-2 bg-emerald-600" onClick={() => setStep(2)}>Next: Farm Details</Button>
              </div>
            )}

            {/* STEP 2: AGRICULTURAL DATA */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Farmer Category</Label>
                  <Select onValueChange={(v) => setProfile({...profile, category: v})}>
                    <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="OBC">OBC</SelectItem>
                      <SelectItem value="SC/ST">SC / ST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Land Size (Hectares)</Label>
                  <Input type="number" step="0.1" value={profile.land_size_hectares} onChange={e => setProfile({...profile, land_size_hectares: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Primary Crops (Comma separated)</Label>
                  <Input placeholder="Wheat, Rice, Cotton" value={profile.primary_crops} onChange={e => setProfile({...profile, primary_crops: e.target.value})} />
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button className="flex-1 bg-emerald-600" onClick={updateProfile} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : 'Save & Continue'}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: DOCUMENT UPLOAD */}
            {step === 3 && (
              <div className="space-y-8 text-center">
                <div className="grid gap-4">
                  {['Aadhar Card', 'PAN Card', 'Land Receipt'].map((doc) => (
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
                  Go to Dashboard <CheckCircle className="ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}