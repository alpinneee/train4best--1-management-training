'use client';

import Layout from '@/components/common/Layout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-gray-50">
      <Layout>{children}</Layout>
    </div>
  )
} 