'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const { data: session } = useSession();

  

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-3xl font-bold text-gray-700 animate-fade-in">Silakan login terlebih dahulu</h1>
      </div>
    );
  } 

  const userRole = session.user?.role || 'participant';

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
      <CardHeader className="flex flex-row items-center gap-6 border-b bg-gray-50 rounded-t-lg">
        <Avatar className="h-24 w-24 ring-2 ring-gray-200 ring-offset-2">
          <AvatarImage src={session.user?.image || ''} />
          <AvatarFallback className="bg-gray-200 text-gray-700 text-xl">
            {session.user?.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <CardTitle className="text-2xl text-gray-700">{session.user?.name}</CardTitle>
          <Badge variant="outline" className="text-sm px-3 py-1 bg-gray-50 border-gray-300">
            {formatRoleName(userRole)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="pb-4 border-b">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Informasi Pribadi</h3>
            <p className="text-gray-700 flex items-center gap-2">
              <span className="font-medium">Email:</span>
              {session.user?.email}
            </p>
          </div>
          {renderRoleSpecificContent()}
        </div>
      </CardContent>
    </Card>
  );
}
