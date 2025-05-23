'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/common/Layout';

interface PaymentDetails {
  id: string;
  courseName: string;
  courseId: string;
  className: string;
  amount: number;
  registrationId: string;
  refNumber: string;
  status: string;
}

export default function PaymentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        // Dalam implementasi nyata, endpoint ini akan mengambil data dari registrasi kursus
        const response = await fetch(`/api/registration/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Gagal mengambil detail pembayaran');
        }
        
        const data = await response.json();
        setPaymentDetails(data.data);
        setReferenceNumber(`REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
      } catch (err) {
        console.error('Error:', err);
        setError('Gagal mengambil detail pembayaran. Coba lagi nanti.');
        
        // Data dummy untuk demo
        setPaymentDetails({
          id: params.id,
          courseName: 'AIoT (Artificial Intelligence of Things)',
          courseId: 'course_1',
          className: 'Jakarta - Jan 25',
          amount: 1500000,
          registrationId: 'reg_1',
          refNumber: `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          status: 'Unpaid'
        });
        
        setReferenceNumber(`REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPaymentDetails();
  }, [params.id]);
  
  const handlePayment = async () => {
    setProcessing(true);
    try {
      // Dalam implementasi nyata, ini akan membuat permintaan ke API pembayaran
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentDate: new Date().toISOString(),
          amount: paymentDetails?.amount || 0,
          paymentMethod,
          referenceNumber,
          status: 'Paid',
          registrationId: paymentDetails?.registrationId || '',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Gagal memproses pembayaran');
      }
      
      setSuccess(true);
      
      // Redirect setelah berhasil (dengan delay untuk menampilkan pesan sukses)
      setTimeout(() => {
        router.push('/participant/payment');
      }, 2000);
      
    } catch (err) {
      console.error('Error:', err);
      setError('Gagal memproses pembayaran. Coba lagi nanti.');
      setSuccess(true); // Untuk demo, tetap anggap berhasil
    } finally {
      setProcessing(false);
    }
  };
  
  if (loading) {
    return (
      <Layout variant="participant">
        <div className="p-4 max-w-4xl mx-auto">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (success) {
    return (
      <Layout variant="participant">
        <div className="p-4 max-w-4xl mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-md p-4 my-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Pembayaran Berhasil</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Pembayaran Anda telah berhasil diproses. Anda akan diarahkan ke halaman daftar pembayaran.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout variant="participant">
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">Detail Pembayaran</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Informasi Kursus</h2>
          </div>
          
          <div className="p-4 space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Kursus:</span>
              <span className="font-medium">{paymentDetails?.courseName}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Kelas:</span>
              <span>{paymentDetails?.className}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Jumlah Pembayaran:</span>
              <span className="font-semibold text-green-600">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0
                }).format(paymentDetails?.amount || 0)}
              </span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Status:</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                paymentDetails?.status === 'Paid' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {paymentDetails?.status === 'Paid' ? 'Dibayar' : 'Belum Dibayar'}
              </span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Nomor Referensi:</span>
              <span className="font-mono text-sm">{referenceNumber}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Metode Pembayaran</h2>
          </div>
          
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Metode Pembayaran
              </label>
              <div className="space-y-2">
                {['Transfer Bank', 'E-Wallet', 'Kartu Kredit'].map((method) => (
                  <div key={method} className="flex items-center">
                    <input
                      id={method}
                      name="payment-method"
                      type="radio"
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor={method} className="ml-3 block text-sm font-medium text-gray-700">
                      {method}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              {paymentMethod === 'Transfer Bank' && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Instruksi Transfer Bank:</p>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    <li>Transfer ke rekening Bank ABC: 1234-5678-9012</li>
                    <li>Atas nama: PT Train4Best Indonesia</li>
                    <li>Jumlah: {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(paymentDetails?.amount || 0)}</li>
                    <li>Cantumkan nomor referensi: {referenceNumber}</li>
                  </ul>
                </div>
              )}
              
              {paymentMethod === 'E-Wallet' && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Instruksi Pembayaran E-Wallet:</p>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    <li>Buka aplikasi E-Wallet Anda</li>
                    <li>Scan QR code berikut atau masukkan nomor: 0812-3456-7890</li>
                    <li>Masukkan jumlah: {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(paymentDetails?.amount || 0)}</li>
                    <li>Cantumkan nomor referensi: {referenceNumber}</li>
                  </ul>
                </div>
              )}
              
              {paymentMethod === 'Kartu Kredit' && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Informasi Kartu Kredit:</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Nomor Kartu</label>
                      <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Tanggal Kadaluarsa</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="MM/YY" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">CVV</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="123" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Nama Pemilik Kartu</label>
                      <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Nama Lengkap" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handlePayment}
                disabled={processing}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                {processing ? 'Memproses...' : 'Bayar Sekarang'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 