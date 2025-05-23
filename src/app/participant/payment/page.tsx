"use client";

import { useState, useEffect, useCallback } from "react";
import Table from "@/components/common/table";
import Layout from "@/components/common/Layout";

interface Payment {
  id: string;
  nama: string;
  tanggal: string;
  paymentMethod: string;
  nomorReferensi: string;
  jumlah: number;
  status: string;
  courseName?: string;
  courseId?: string;
  registrationId?: string;
}

interface Column<T> {
  header: string;
  accessor: keyof T | ((data: T) => React.ReactNode);
  className?: string;
}

export default function PaymentReport() {
  const [currentPage, setCurrentPage] = useState(1);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isDbConfigured, setIsDbConfigured] = useState(true);
  
  // Fungsi untuk mengambil data pembayaran dari API
  const fetchPayments = useCallback(async (pageNum: number = 1, search: string = '', method: string = '') => {
    setLoading(true);
    try {
      // Ambil email user dari localStorage (jika ada)
      const userEmail = localStorage.getItem('userEmail') || '';
      
      // Buat URL untuk fetch dengan parameter
      let url = `/api/payment?page=${pageNum}&limit=5`;
      if (userEmail) url += `&email=${encodeURIComponent(userEmail)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (method) url += `&method=${encodeURIComponent(method)}`;
      
      // Tambahkan timestamp untuk menghindari cache
      url += `&_=${new Date().getTime()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.text();
        // Cek apakah error karena database belum dikonfigurasi
        if (response.status === 500 && errorData.includes('database')) {
          setIsDbConfigured(false);
          throw new Error('Database belum dikonfigurasi');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.data) {
        setPayments(data.data);
        if (data.meta) {
          setTotalPages(data.meta.totalPages || 1);
        }
      } else {
        setPayments([]);
        setTotalPages(1);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching payments:", err);
      if (err instanceof Error && err.message.includes('Database belum dikonfigurasi')) {
        setIsDbConfigured(false);
        setError('Database belum dikonfigurasi. Silakan klik tombol "Konfigurasi Database" di bawah.');
      } else {
        setError("Gagal mengambil data pembayaran. Silakan coba lagi nanti.");
      }
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Effect untuk mengambil data saat pertama kali atau saat parameter berubah
  useEffect(() => {
    fetchPayments(currentPage, searchTerm, paymentMethod);
  }, [fetchPayments, currentPage, searchTerm, paymentMethod]);
  
  // Setup database
  const setupDatabase = async () => {
    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mode: 'minimal' })
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsDbConfigured(true);
        
        // Simpan email demo user untuk demo yang lebih seamless
        localStorage.setItem('userEmail', 'demo@example.com');
        
        // Reload data setelah database dikonfigurasi
        fetchPayments();
        alert('Database berhasil dikonfigurasi!');
      } else {
        const error = await response.text();
        console.error('Error configuring database:', error);
        alert('Gagal mengkonfigurasi database. Lihat konsol untuk detail.');
      }
    } catch (error) {
      console.error('Error setting up database:', error);
      alert('Terjadi kesalahan saat mengkonfigurasi database.');
    }
  };
  
  // Handler untuk pencarian
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset ke halaman pertama saat pencarian berubah
  };
  
  // Handler untuk filter metode pembayaran
  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPaymentMethod(e.target.value);
    setCurrentPage(1); // Reset ke halaman pertama saat filter berubah
  };

  const columns: Column<Payment>[] = [
    { 
      header: "No", 
      accessor: (payment) => {
        // Buat properti nomor urut untuk setiap payment
        const index = payments.findIndex(p => p.id === payment.id);
        return (currentPage - 1) * 5 + index + 1;
      },
      className: "w-12 text-center"
    },
    { 
      header: "Nama", 
      accessor: "nama",
      className: "min-w-[120px]"
    },
    { 
      header: "Tanggal", 
      accessor: "tanggal",
      className: "min-w-[100px]"
    },
    { 
      header: "Payment Method", 
      accessor: "paymentMethod",
      className: "min-w-[120px]"
    },
    { 
      header: "Nomor Referensi", 
      accessor: "nomorReferensi",
      className: "min-w-[140px]"
    },
    { 
      header: "Jumlah (IDR)", 
      accessor: (payment) => new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(payment.jumlah),
      className: "min-w-[100px]"
    },
    {
      header: "Status",
      accessor: (payment: Payment) => (
        <span
          className={`px-1 py-0.5 text-xs font-medium rounded-full ${
            payment.status === "Paid"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {payment.status}
        </span>
      ),
      className: "min-w-[80px]"
    },
    {
      header: "Action",
      accessor: (payment: Payment) => (
        <div className="flex space-x-1 justify-center">
          {payment.status === "Unpaid" ? (
            <a 
              href={`/participant/payment/${payment.id}`}
              className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 inline-flex items-center"
            >
              Bayar
            </a>
          ) : (
            <button className="text-blue-600 hover:text-blue-900 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
                <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
          )}
        </div>
      ),
      className: "w-20 text-center"
    },
  ];

  const ITEMS_PER_PAGE = 5;

  // Render konfigurasi database jika belum terkonfigurasi
  if (!isDbConfigured) {
    return (
      <Layout variant="participant">
        <div className="p-2">
          <div className="space-y-4 py-8">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md text-sm">
              Database belum dikonfigurasi. Silakan klik tombol di bawah untuk mengonfigurasi database.
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={setupDatabase}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Konfigurasi Database
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout variant="participant">
      <div className="p-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
          <h1 className="text-lg md:text-xl text-gray-700">Payment Report</h1>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <select 
              className="w-full sm:w-auto px-2 py-1 text-xs border rounded"
              value={paymentMethod}
              onChange={handleMethodChange}
            >
              <option value="">Semua Metode</option>
              <option value="Transfer Bank">Transfer Bank</option>
              <option value="E-Wallet">E-Wallet</option>
              <option value="Kartu Kredit">Kartu Kredit</option>
            </select>

            <button className="w-full sm:w-auto border px-2 py-1 rounded flex items-center justify-center gap-1 text-xs text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3h-7z"/>
              </svg>
              Print File
            </button>

            <div className="relative w-full sm:w-auto">
              <input 
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-2 py-1 pl-7 text-xs border rounded"
              />
              <svg 
                className="absolute left-2 top-1/2 -translate-y-1/2" 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24"
              >
                <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto -mx-2 px-2">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md my-4">
              {error}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Tidak ada data pembayaran yang ditemukan.</p>
            </div>
          ) : (
            <Table
              columns={columns}
              data={payments}
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={ITEMS_PER_PAGE * totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
