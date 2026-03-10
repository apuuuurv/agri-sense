import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  // Document Upload State
  const [uploadType, setUploadType] = useState('Aadhar');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Profile Form State
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
      // navigate('/auth'); // Uncomment when you have a login page
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
      // EXACT MATCH: These keys MUST match the parameters in FastAPI's upload.py
      docData.append('file', selectedFile); 
      docData.append('doc_type', uploadType); 

      // Calls /api/upload since your main.py has prefix="/api/upload"
      await api.post('/upload', docData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success(`${uploadType} uploaded successfully!`);
      setSelectedFile(null);
      
      // Clear the file input visually
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

  if (!farmer) return <div className="flex h-screen items-center justify-center font-bold text-emerald-600">Loading AgriSense...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-emerald-950 text-white p-6 flex flex-col border-r border-emerald-900">
        <div className="flex items-center gap-2 mb-10">
          <LayoutDashboard className="text-emerald-400" />
          <span className="font-black text-xl tracking-tighter">AGRISENSE</span>
        </div>
        <nav className="space-y-2 flex-1">
          <Button 
            variant="ghost" 
            className={`w-full justify-start hover:bg-emerald-900 ${activeTab === 'home' ? 'bg-emerald-900 text-white' : 'text-emerald-100'}`}
            onClick={() => setActiveTab('home')}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" /> Home
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start hover:bg-emerald-900 ${activeTab === 'profile' ? 'bg-emerald-900 text-white' : 'text-emerald-100'}`}
            onClick={() => setActiveTab('profile')}
          >
            <UserCircle className="mr-2 h-4 w-4" /> My Profile
          </Button>
        </nav>
        <Button 
          variant="outline" 
          className="mt-4 border-emerald-800 text-emerald-400 hover:bg-emerald-900 hover:text-emerald-300"
          onClick={() => {
            localStorage.removeItem('access_token');
            navigate('/');
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          
          {/* HOME TAB */}
          {activeTab === 'home' && (
            <>
              <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">Welcome, {farmer.full_name}</h1>
                  <p className="text-slate-500 font-medium italic">Empowering your farm with AI</p>
                </div>
                {farmer.land_size_hectares ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-4 py-1">Verified Profile</Badge>
                ) : (
                  <Button size="sm" variant="destructive" onClick={() => setActiveTab('profile')} className="animate-pulse">
                    <AlertCircle className="mr-2 h-4 w-4" /> Complete Setup
                  </Button>
                )}
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <Card className="border-none shadow-md bg-white">
                  <CardContent className="pt-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Land</p>
                    <div className="text-3xl font-black mt-1">{farmer.land_size_hectares || 0} Ha</div>
                    <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center">
                        <MapPin className="h-3 w-3 mr-1"/> {farmer.district || 'Location not set'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white">
                  <CardContent className="pt-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verification</p>
                    <div className="text-3xl font-black mt-1 text-emerald-600">
                      {farmer.aadhar_number ? 'Verified' : 'Pending'}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Update profile to verify</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-emerald-600 text-white shadow-emerald-200">
                  <CardContent className="pt-6">
                    <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest">AI Match Score</p>
                    <div className="text-4xl font-black mt-1">82%</div>
                    <div className="flex items-center text-xs mt-2 text-emerald-100">
                      <TrendingUp className="h-3 w-3 mr-1" /> 4 New Matches
                    </div>
                  </CardContent>
                </Card>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FileCheck className="text-emerald-600" /> Eligible Government Schemes
              </h3>
              <div className="space-y-4">
                 {[
                   { name: "PM-Kisan Nidhi", amount: "₹6,000/yr", type: "Direct Transfer", code: "PMK" },
                   { name: "Crop Insurance (PMFBY)", amount: "95% Cover", type: "Insurance", code: "FBY" }
                 ].map((scheme, i) => (
                   <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-500 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600 font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          {scheme.code}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{scheme.name}</h4>
                          <p className="text-sm text-slate-500">{scheme.type} • Benefit: {scheme.amount}</p>
                        </div>
                      </div>
                      <Button variant="ghost" className="rounded-full group-hover:bg-emerald-600 group-hover:text-white">
                        Apply <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                   </div>
                 ))}
              </div>
            </>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6 pb-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">Farmer Profile</h1>
                  <p className="text-slate-500">Ensure your details are accurate for AI scheme matching.</p>
                </div>
                <Button onClick={handleProfileUpdate} className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save All Changes
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. PERSONAL DETAILS */}
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5 text-emerald-600"/> Personal & Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label>Full Name</Label>
                      <Input value={formData.full_name} disabled className="bg-slate-50" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Email</Label>
                      <Input value={formData.email} disabled className="bg-slate-50" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Phone Number</Label>
                      <Input value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} placeholder="+91..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Age</Label>
                        <Input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Gender</Label>
                        <Select value={formData.gender} onValueChange={v => setFormData({...formData, gender: v})}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
                        <Label>Category</Label>
                        <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="General">General</SelectItem>
                            <SelectItem value="OBC">OBC</SelectItem>
                            <SelectItem value="SC">SC</SelectItem>
                            <SelectItem value="ST">ST</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Differently Abled?</Label>
                        <Select value={formData.is_differently_abled} onValueChange={v => setFormData({...formData, is_differently_abled: v})}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 2. LOCATION & EDUCATION */}
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5 text-emerald-600"/> Location & Education</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label>State</Label>
                      <Input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label>District</Label>
                      <Input value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Pincode</Label>
                      <Input value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label className="flex items-center gap-2"><GraduationCap className="h-4 w-4"/> Highest Qualification</Label>
                      <Select value={formData.highest_qualification} onValueChange={v => setFormData({...formData, highest_qualification: v})}>
                        <SelectTrigger><SelectValue placeholder="Select Education Level" /></SelectTrigger>
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

                {/* 3. IDENTITY & FINANCIALS */}
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><CreditCard className="h-5 w-5 text-emerald-600"/> Identity & Financials</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label>Aadhar Number</Label>
                      <Input value={formData.aadhar_number} onChange={e => setFormData({...formData, aadhar_number: e.target.value})} placeholder="12-digit number" />
                    </div>
                    <div className="grid gap-2">
                      <Label>PAN Number</Label>
                      <Input value={formData.pan_number} onChange={e => setFormData({...formData, pan_number: e.target.value})} placeholder="ABCDE1234F" className="uppercase" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Annual Income (₹)</Label>
                      <Input type="number" value={formData.annual_income} onChange={e => setFormData({...formData, annual_income: e.target.value})} placeholder="e.g. 150000" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Bank Account Linked for DBT?</Label>
                      <Select value={formData.bank_account_linked} onValueChange={v => setFormData({...formData, bank_account_linked: v})}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* 4. AGRICULTURAL DATA */}
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Tractor className="h-5 w-5 text-emerald-600"/> Agricultural Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Land Size (Hectares)</Label>
                        <Input type="number" step="0.01" value={formData.land_size_hectares} onChange={e => setFormData({...formData, land_size_hectares: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Farmer Type</Label>
                        <Select value={formData.farmer_type} onValueChange={v => setFormData({...formData, farmer_type: v})}>
                          <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
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
                      <Label>Irrigation Type</Label>
                      <Select value={formData.irrigation_type} onValueChange={v => setFormData({...formData, irrigation_type: v})}>
                        <SelectTrigger><SelectValue placeholder="Select Irrigation" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Rainfed">Rainfed / Unirrigated</SelectItem>
                          <SelectItem value="Canal">Canal</SelectItem>
                          <SelectItem value="Borewell">Borewell / Tube well</SelectItem>
                          <SelectItem value="Drip">Drip / Sprinkler</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Primary Crops (Comma separated)</Label>
                      <textarea 
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-emerald-500"
                        placeholder="Wheat, Rice, Cotton..."
                        value={formData.primary_crops}
                        onChange={e => setFormData({...formData, primary_crops: e.target.value})}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* 5. DOCUMENT UPLOAD (OCR READY) */}
                <Card className="border-none shadow-sm md:col-span-2 border-t-4 border-t-emerald-500">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <UploadCloud className="h-5 w-5 text-emerald-600"/> 
                      Document Center
                    </CardTitle>
                    <p className="text-sm text-slate-500">
                      Upload your Aadhar, PAN, or Land Records here. (OCR Auto-fill coming soon!)
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex-1 w-full space-y-2">
                        <Label>Document Type</Label>
                        <Select value={uploadType} onValueChange={setUploadType}>
                          <SelectTrigger className="bg-white"><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Aadhar">Aadhar Card</SelectItem>
                            <SelectItem value="PAN">PAN Card</SelectItem>
                            <SelectItem value="Land_Record">Land Record (7/12, etc.)</SelectItem>
                            <SelectItem value="Bank_Passbook">Bank Passbook</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1 w-full space-y-2">
                        <Label>Select File (Image or PDF)</Label>
                        <Input 
                          id="document-upload"
                          type="file" 
                          className="bg-white cursor-pointer" 
                          accept="image/*,.pdf"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} 
                        />
                      </div>
                      <Button 
                        onClick={handleDocumentUpload} 
                        disabled={!selectedFile || uploadingDoc} 
                        className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto"
                      >
                        {uploadingDoc ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UploadCloud className="h-4 w-4 mr-2" />}
                        Upload File
                      </Button>
                    </div>

                    <div>
                      <Label className="mb-3 block text-slate-700 font-bold">Verified Documents on File</Label>
                      {farmer?.documents_uploaded?.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {farmer.documents_uploaded.map((docString: string, idx: number) => {
                            // Extract just the document type name from "doc_type:path" string format
                            const docName = typeof docString === 'string' ? docString.split(':')[0] : 'Document'; 
                            return (
                              <Badge key={idx} variant="outline" className="px-4 py-2 flex items-center gap-2 bg-emerald-50 border-emerald-200 text-emerald-800 text-sm">
                                <FileText className="h-4 w-4" /> 
                                {docName.replace('_', ' ')}
                              </Badge>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-sm text-slate-400 italic bg-white border border-dashed border-slate-200 p-4 rounded-lg text-center">
                          No documents uploaded yet.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}