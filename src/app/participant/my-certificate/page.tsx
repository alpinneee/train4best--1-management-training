"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Layout from "@/components/common/Layout";

// Interface untuk tipe data sertifikat
interface Certificate {
  id: string;
  certificateNumber: string;
  issueDate: Date;
  courseName: string;
  courseType: string;
  location: string;
  startDate: Date;
  endDate: Date;
  participantName: string;
  description: string[];
}

const MyCertificatePage = () => {
  const [search, setSearch] = useState("");
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Fungsi untuk mengambil data sertifikat dari API
  const fetchCertificates = useCallback(async (pageNum: number = 1, searchTerm: string = "") => {
    setLoading(true);
    try {
      // Ambil email user dari localStorage (jika ada)
      const userEmail = localStorage.getItem('userEmail') || '';
      
      // Buat URL untuk fetch dengan parameter
      let url = `/api/certificate?page=${pageNum}&limit=8`;
      if (userEmail) url += `&email=${encodeURIComponent(userEmail)}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      
      // Tambahkan timestamp untuk menghindari cache
      url += `&_=${new Date().getTime()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.data) {
        setCertificates(data.data);
        if (data.meta) {
          setTotalPages(data.meta.totalPages || 1);
        }
      } else {
        setCertificates([]);
        setTotalPages(1);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching certificates:", err);
      setError("Gagal mengambil data sertifikat. Silakan coba lagi nanti.");
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Effect untuk mengambil data saat pertama kali atau saat page/search berubah
  useEffect(() => {
    fetchCertificates(page, search);
  }, [fetchCertificates, page, search]);
  
  // Handler untuk pencarian
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setPage(1); // Reset ke halaman pertama saat pencarian berubah
  };
  
  // Handler untuk pagination
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  
  // Filter sertifikat berdasarkan pencarian (dilakukan di client jika sudah ada data)
  const filteredCertificates = certificates.filter((cert) =>
    cert.courseName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout variant="participant">
      <div className="p-3 sm:p-4 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
          <h1 className="text-xl font-semibold text-gray-700 mb-2 sm:mb-0">
            Sertifikat Saya
          </h1>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari..."
              value={search}
              onChange={handleSearch}
              className="w-full px-3 py-1.5 rounded border text-sm text-gray-700 border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-300"
            />
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md my-4">
            {error}
          </div>
        ) : filteredCertificates.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Tidak ada sertifikat yang ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredCertificates.map((cert) => (
              <div key={cert.id} className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-blue-50 p-3">
                  <h2 className="font-medium text-blue-800 truncate">{cert.courseName}</h2>
                  <p className="text-xs text-gray-600">{cert.courseType}</p>
                </div>
                
                <div className="p-3 space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Nomor Sertifikat</p>
                    <p className="text-sm font-medium">{cert.certificateNumber}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Tanggal Terbit</p>
                    <p className="text-sm">
                      {new Date(cert.issueDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <a
                      href={`/certificate/${cert.id}/print`}
                      target="_blank"
                      className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
                      </svg>
                      Cetak
                    </a>
                    <a
                      href={`/participant/certificate/${cert.id}`}
                      className="text-gray-600 hover:text-gray-800 text-xs flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Detail
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {!loading && filteredCertificates.length > 0 && (
          <div className="flex justify-center items-center mt-4 gap-1 text-sm">
            <button 
              className="p-1 rounded hover:bg-gray-200 text-xs disabled:opacity-50 disabled:pointer-events-none" 
              disabled={page === 1}
              onClick={() => handlePageChange(1)}
            >
              {"<<"}
            </button>
            <button 
              className="p-1 rounded hover:bg-gray-200 text-xs disabled:opacity-50 disabled:pointer-events-none" 
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              {"<"}
            </button>
            
            {/* Show page numbers */}
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              // Calculate which pages to show
              let pageToShow = page;
              if (page === 1) pageToShow = 1 + i;
              else if (page === totalPages) pageToShow = totalPages - 2 + i;
              else pageToShow = page - 1 + i;
              
              // Only show if the page is within range
              if (pageToShow > 0 && pageToShow <= totalPages) {
                return (
                  <button
                    key={pageToShow}
                    onClick={() => handlePageChange(pageToShow)}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      pageToShow === page ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
                    }`}
                  >
                    {pageToShow}
                  </button>
                );
              }
              return null;
            })}
            
            <button 
              className="p-1 rounded hover:bg-gray-200 text-xs disabled:opacity-50 disabled:pointer-events-none" 
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              {">"}
            </button>
            <button 
              className="p-1 rounded hover:bg-gray-200 text-xs disabled:opacity-50 disabled:pointer-events-none" 
              disabled={page === totalPages}
              onClick={() => handlePageChange(totalPages)}
            >
              {">>"}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyCertificatePage;
