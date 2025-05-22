'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Form state
  const [isEditing, setIsEditing] = useState(true); // Selalu edit mode
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    birthDate: '',
    jobTitle: '',
    company: '',
  });
  
  // Check if user has completed profile
  const [profileComplete, setProfileComplete] = useState(true);
  
  // Add loading state to better handle session loading
  const [isLoading, setIsLoading] = useState(true);
  
  // Load participants awal
  useEffect(() => {
    const loadProfileData = async () => {
      // Sederhanakan proses loading dengan langsung mengambil parameter dari URL
      const urlParams = new URLSearchParams(window.location.search);
      const emailParam = urlParams.get('email');
      
      // Email yang akan digunakan untuk fetch data
      const emailToUse = emailParam || session?.user?.email;
      
      if (!emailToUse) {
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("Fetching profile data for email:", emailToUse);
        const response = await fetch(`/api/profile/get?email=${encodeURIComponent(emailToUse)}`);
        
        if (!response.ok) {
          console.error("Failed to fetch profile:", response.status);
          setIsLoading(false);
          return;
        }
        
        const { data } = await response.json();
        console.log("Profile data retrieved:", data);
        
        if (data) {
          // Update form data with retrieved profile data
          setFormData({
            fullName: data.fullName || data.name || '',
            email: data.email || '',
            phone: data.phone_number || '',
            address: data.address || '',
            gender: data.gender || '',
            birthDate: data.birth_date ? new Date(data.birth_date).toISOString().split('T')[0] : '',
            jobTitle: data.job_title || '',
            company: data.company || '',
          });
          
          // Check if profile is complete
          const requiredFields = ['fullName', 'gender', 'phone_number', 'address', 'birth_date'];
          const hasCompleteProfile = requiredFields.every(field => !!data[field]);
          
          setProfileComplete(hasCompleteProfile && data.hasProfile);
          setIsEditing(!hasCompleteProfile || !data.hasProfile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (status !== 'loading') {
      loadProfileData();
    }
  }, [session, status]);
  
  // Initialize form with URL email parameter
  useEffect(() => {
    // Sederhanakan proses loading dengan langsung mengambil parameter dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    
    if (emailParam) {
      setFormData(prev => ({
        ...prev,
        email: emailParam
      }));
    } else if (session?.user?.email) {
      // Jika tidak ada email di URL tapi ada di session
      setFormData(prev => ({
        ...prev,
        email: session.user.email,
      }));
    }
  }, [session]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: 'Menyimpan data...', type: 'warning' });
    
    try {
      // Hapus delay yang tidak perlu
      console.log("Submitting profile data with:", formData);
      
      // First try - menggunakan endpoint update profile reguler
      let response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      console.log("Profile update response status:", response.status);
      let data = await response.json();
      console.log("Profile update response data:", data);
      
      if (response.ok) {
        setMessage({ text: 'Profil berhasil diperbarui!', type: 'success' });
        // Tetap dalam mode edit tapi tandai sebagai selesai
        setProfileComplete(true);
        
        // Kurangi delay pada reload
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage({ text: data.error || 'Gagal memperbarui profil', type: 'error' });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage({ text: 'Terjadi kesalahan saat memperbarui profil. Silakan coba lagi.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use combined session for rendering
  const activeSession = session;

  // Add conditional rendering for loading state
  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-2 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <h1 className="text-3xl font-bold text-gray-700 animate-fade-in mb-4">Silakan login terlebih dahulu</h1>
        <button
          onClick={() => router.push('/debug-login')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Login Sekarang
        </button>
      </div>
    );
  } 

  const userRole = activeSession.user?.role || activeSession.user?.userType || 'participant';

  // Display profile completion banner for incomplete profiles
  const renderProfileCompletionBanner = () => {
    if (!profileComplete) {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Silakan lengkapi profil Anda untuk pengalaman yang lebih baik.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Profile edit form
  const renderProfileForm = () => {
    if (isEditing) {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          {message.text && (
            <div className={`p-3 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : message.type === 'warning' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-600'}`}>
              {message.text}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-gray-100"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon <span className="text-red-500">*</span></label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin <span className="text-red-500">*</span></label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
                required
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir <span className="text-red-500">*</span></label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Perusahaan</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat <span className="text-red-500">*</span></label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
              required
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </div>
        </form>
      );
    }
    return null;
  };

  // Existing profile content
  const renderProfileContent = () => {
    if (!isEditing) {
      return (
        <>
          <div className="pb-4 border-b">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Informasi Pribadi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p className="text-gray-700 flex items-center gap-2">
                <span className="font-medium">Email:</span>
                {formData.email}
              </p>
              <p className="text-gray-700 flex items-center gap-2">
                <span className="font-medium">No. Telepon:</span>
                {formData.phone || '-'}
              </p>
              <p className="text-gray-700 flex items-center gap-2">
                <span className="font-medium">Jenis Kelamin:</span>
                {formData.gender || '-'}
              </p>
              <p className="text-gray-700 flex items-center gap-2">
                <span className="font-medium">Tanggal Lahir:</span>
                {formData.birthDate ? new Date(formData.birthDate).toLocaleDateString('id-ID') : '-'}
              </p>
              {formData.jobTitle && (
                <p className="text-gray-700 flex items-center gap-2">
                  <span className="font-medium">Jabatan:</span>
                  {formData.jobTitle}
                </p>
              )}
              {formData.company && (
                <p className="text-gray-700 flex items-center gap-2">
                  <span className="font-medium">Perusahaan:</span>
                  {formData.company}
                </p>
              )}
            </div>
            <div className="mt-2">
              <p className="text-gray-700 flex items-start gap-2">
                <span className="font-medium">Alamat:</span>
                <span>{formData.address || '-'}</span>
              </p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-md text-sm hover:bg-blue-100"
              >
                Edit Profil
              </button>
            </div>
          </div>
          {renderRoleSpecificContent()}
        </>
      );
    }
    return null;
  };

  const renderRoleSpecificContent = () => {
    switch (userRole) {
      case 'super_admin':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Informasi Super Admin</h2>
            <p className="text-gray-700 italic">Anda memiliki akses penuh ke semua fitur sistem</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="bg-gray-50 rounded-t-lg border-b">
                  <CardTitle className="text-gray-700">Statistik Sistem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-4">
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Total Pengguna</span>
                    <span className="font-semibold">100</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Total Kursus</span>
                    <span className="font-semibold">25</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Total Instruktur</span>
                    <span className="font-semibold">15</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'instructor':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Informasi Instruktur</h2>
            <p className="text-gray-700 italic">Anda adalah instruktur yang mengajar kursus</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="bg-gray-50 rounded-t-lg border-b">
                  <CardTitle className="text-gray-700">Kursus yang Diajar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-4">
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Total Kursus</span>
                    <span className="font-semibold">5</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Total Siswa</span>
                    <span className="font-semibold">50</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Informasi Peserta</h2>
            <p className="text-gray-700 italic">Anda adalah peserta yang mengikuti kursus</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="bg-gray-50 rounded-t-lg border-b">
                  <CardTitle className="text-gray-700">Kursus yang Diikuti</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-4">
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Total Kursus</span>
                    <span className="font-semibold">3</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Progress</span>
                    <span className="font-semibold">75%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  // Format role name untuk display
  const formatRoleName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'instructor':
        return 'Instructor';
      default:
        return 'Participant';
    }
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300">
      {renderProfileCompletionBanner()}
      <CardHeader className="flex flex-row items-center gap-6 border-b bg-gray-50 rounded-t-lg">
        <Avatar className="h-24 w-24 ring-2 ring-gray-200 ring-offset-2">
          <AvatarImage src="/default-avatar.png" />
          <AvatarFallback className="bg-gray-200 text-gray-700 text-xl">
            {formData.fullName?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <CardTitle className="text-2xl text-gray-700">Lengkapi Profil Anda</CardTitle>
          <Badge variant="outline" className="text-sm px-3 py-1 bg-gray-50 border-gray-300">
            Peserta
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {renderProfileForm()}
          {renderProfileContent()}
        </div>
      </CardContent>
    </Card>
  );
}
