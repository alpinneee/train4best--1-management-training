"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/common/Layout";
import { Printer, ArrowLeft, Edit, Trash2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface CertificateDetail {
  id: string;
  name: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  pdfUrl: string | null;
  participant: {
    id: string;
    name: string;
    company: string;
    jobTitle: string;
  } | null;
  course: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export default function CertificateDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [certificate, setCertificate] = useState<CertificateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    async function fetchCertificate() {
      try {
        const response = await fetch(`/api/certificate/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Certificate not found");
            router.push("/certificate-expired");
            return;
          }
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setCertificate(data);
      } catch (error) {
        console.error("Failed to fetch certificate:", error);
        toast.error("Failed to load certificate details");
      } finally {
        setLoading(false);
      }
    }

    fetchCertificate();
  }, [params.id, router]);

  const deleteCertificate = async () => {
    try {
      const response = await fetch(`/api/certificate/${params.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      toast.success("Certificate deleted successfully");
      router.push("/certificate-expired");
    } catch (error) {
      console.error("Failed to delete certificate:", error);
      toast.error("Failed to delete certificate");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const DeleteModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <AlertCircle size={24} />
          <h3 className="text-lg font-semibold">Confirm Deletion</h3>
        </div>
        <p className="mb-6">Are you sure you want to delete this certificate? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button 
            onClick={deleteCertificate}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!certificate) {
    return (
      <Layout>
        <div className="p-4">
          <div className="text-center p-6 bg-gray-50 rounded-md">
            <p className="text-gray-500">Certificate not found</p>
            <Link 
              href="/certificate-expired"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Certificates
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link 
              href="/certificate-expired" 
              className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </Link>
            <h1 className="text-xl font-semibold ml-2">Certificate Details</h1>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/certificate/${params.id}/print`}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
            >
              <Printer size={16} />
              Print
            </Link>
            <Link
              href={`/certificate/${params.id}/edit`}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              <Edit size={16} />
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Certificate Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{certificate.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Certificate Number</p>
                  <p className="font-medium">{certificate.certificateNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Issue Date</p>
                  <p className="font-medium">{formatDate(certificate.issueDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expiry Date</p>
                  <p className="font-medium">{formatDate(certificate.expiryDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    certificate.status === 'Valid' 
                      ? 'bg-green-100 text-green-800' 
                      : certificate.status === 'Expired' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {certificate.status}
                  </span>
                </div>
                
                {/* Certificate PDF Preview */}
                {certificate.pdfUrl && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-1">Certificate PDF</p>
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-gray-50 p-2 flex justify-between items-center">
                        <p className="text-xs font-medium">Certificate Document</p>
                        <a 
                          href={certificate.pdfUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Download
                        </a>
                      </div>
                      <div className="p-3 bg-white">
                        <iframe 
                          src={certificate.pdfUrl} 
                          className="w-full h-72 border"
                          title="Certificate PDF"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Related Information</h2>
              <div className="space-y-4">
                {certificate.participant && (
                  <div>
                    <h3 className="text-sm text-gray-500 mb-2">Participant</h3>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="font-medium">{certificate.participant.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {certificate.participant.jobTitle}{certificate.participant.company ? ` at ${certificate.participant.company}` : ''}
                      </p>
                    </div>
                  </div>
                )}

                {certificate.course && (
                  <div>
                    <h3 className="text-sm text-gray-500 mb-2">Course</h3>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="font-medium">{certificate.course.name}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm text-gray-500 mb-2">Metadata</h3>
                  <div className="bg-gray-50 p-3 rounded-md space-y-2">
                    <p className="text-sm">
                      <span className="text-gray-600">Created: </span>
                      <span>{new Date(certificate.createdAt).toLocaleString()}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Last Updated: </span>
                      <span>{new Date(certificate.updatedAt).toLocaleString()}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && <DeleteModal />}
    </Layout>
  );
} 