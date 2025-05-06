'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <h1 className="text-3xl font-bold text-gray-700">Silakan login terlebih dahulu</h1>
      </div>
    );
  }

  const userRole = session.user?.role || 'participant';

  const renderRoleSpecificContent = () => {
    switch (userRole) {
      case 'superadmin':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Informasi Superadmin</h2>
            <p>Anda memiliki akses penuh ke semua fitur sistem</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Statistik Sistem</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Total Pengguna: 100</p>
                  <p>Total Kursus: 25</p>
                  <p>Total Instruktur: 15</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'instructor':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Informasi Instruktur</h2>
            <p>Anda adalah instruktur yang mengajar kursus</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Kursus yang Diajar</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Total Kursus: 5</p>
                  <p>Total Siswa: 50</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Informasi Peserta</h2>
            <p>Anda adalah peserta yang mengikuti kursus</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Kursus yang Diikuti</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Total Kursus: 3</p>
                  <p>Progress: 75%</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session.user?.image || ''} />
              <AvatarFallback>{session.user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{session.user?.name}</CardTitle>
              <Badge variant="outline" className="mt-2">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Informasi Pribadi</h3>
                <p>Email: {session.user?.email}</p>
              </div>
              {renderRoleSpecificContent()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
