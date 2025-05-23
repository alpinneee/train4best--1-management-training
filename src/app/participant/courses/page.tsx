'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/common/Layout';
import Link from 'next/link';

interface CourseRegistration {
  id: string;
  courseId: string;
  courseName: string;
  className: string;
  schedule: string;
  registrationDate: string;
  amount: number;
  status: string;
}

export default function ParticipantCourses() {
  const [registrations, setRegistrations] = useState<CourseRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        // Dalam implementasi nyata, ambil data dari API
        const userEmail = localStorage.getItem('userEmail') || '';
        const url = `/api/registration?email=${encodeURIComponent(userEmail)}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.data) {
          setRegistrations(data.data);
        } else {
          // Fallback to dummy data for demo
          setRegistrations([
            {
              id: 'reg_1',
              courseId: 'course_1',
              courseName: 'AIoT (Artificial Intelligence of Things)',
              className: 'Jakarta - Jan 25',
              schedule: '25 Jan 2024 - 28 Jan 2024',
              registrationDate: '2024-01-10',
              amount: 1500000,
              status: 'Unpaid'
            },
            {
              id: 'reg_2',
              courseId: 'course_2',
              courseName: 'Full Stack Web Development',
              className: 'Online - Feb 5',
              schedule: '5 Feb 2024 - 10 Feb 2024',
              registrationDate: '2024-01-15',
              amount: 1200000,
              status: 'Paid'
            },
            {
              id: 'reg_3',
              courseId: 'course_3',
              courseName: 'Data Science Fundamentals',
              className: 'Bandung - Mar 15',
              schedule: '15 Mar 2024 - 20 Mar 2024',
              registrationDate: '2024-02-01',
              amount: 1800000,
              status: 'Unpaid'
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching registrations:', err);
        setError('Gagal mengambil data registrasi kursus.');
        
        // Fallback to dummy data
        setRegistrations([
          {
            id: 'reg_1',
            courseId: 'course_1',
            courseName: 'AIoT (Artificial Intelligence of Things)',
            className: 'Jakarta - Jan 25',
            schedule: '25 Jan 2024 - 28 Jan 2024',
            registrationDate: '2024-01-10',
            amount: 1500000,
            status: 'Unpaid'
          },
          {
            id: 'reg_2',
            courseId: 'course_2',
            courseName: 'Full Stack Web Development',
            className: 'Online - Feb 5',
            schedule: '5 Feb 2024 - 10 Feb 2024',
            registrationDate: '2024-01-15',
            amount: 1200000,
            status: 'Paid'
          },
          {
            id: 'reg_3',
            courseId: 'course_3',
            courseName: 'Data Science Fundamentals',
            className: 'Bandung - Mar 15',
            schedule: '15 Mar 2024 - 20 Mar 2024',
            registrationDate: '2024-02-01',
            amount: 1800000,
            status: 'Unpaid'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRegistrations();
  }, []);
  
  if (loading) {
    return (
      <Layout variant="participant">
        <div className="p-4">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout variant="participant">
      <div className="p-4">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">Kursus Terdaftar</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {registrations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">Anda belum terdaftar di kursus apapun.</p>
            <Link href="/participant/explore" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Jelajahi Kursus
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {registrations.map((registration) => (
              <div key={registration.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-800">{registration.courseName}</h2>
                  <p className="text-sm text-gray-500">{registration.className}</p>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Jadwal:</span>
                    <span>{registration.schedule}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tanggal Registrasi:</span>
                    <span>{registration.registrationDate}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Biaya:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0
                      }).format(registration.amount)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status Pembayaran:</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      registration.status === 'Paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {registration.status === 'Paid' ? 'Dibayar' : 'Belum Dibayar'}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 flex justify-between">
                  <Link href={`/participant/courses/${registration.courseId}`} className="text-blue-600 hover:text-blue-800 text-sm">
                    Detail Kursus
                  </Link>
                  
                  {registration.status === 'Unpaid' && (
                    <Link href={`/participant/payment/${registration.id}`} className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600">
                      Bayar Sekarang
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
} 