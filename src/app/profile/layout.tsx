'use client';

import { ReactNode, useState } from 'react';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';
import { useSession } from 'next-auth/react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { data: session } = useSession();
  
  // Menentukan variant sidebar berdasarkan role
  let variant: 'admin' | 'participant' | 'instructure' = 'participant';
  
  if (session?.user?.role === 'super_admin') {
    variant = 'admin';
  } else if (session?.user?.role === 'instructor') {
    variant = 'instructure';
  }

  const handleMobileOpen = () => {
    setIsMobileOpen(true);
    document.body.style.overflow = 'hidden';
  };

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onMobileMenuClick={handleMobileOpen} />
      <div className="flex flex-1">
        <Sidebar
          isMobileOpen={isMobileOpen}
          onMobileClose={() => {
            setIsMobileOpen(false);
            document.body.style.overflow = 'auto';
          }}
          variant={variant}
        />
        <main className="flex-1 p-4 bg-gray-50">{children}</main>
      </div>
      {/* <Footer /> */}
    </div>
  );
} 