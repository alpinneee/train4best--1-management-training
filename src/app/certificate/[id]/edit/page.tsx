"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/common/Layout";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface ParticipantOption {
  id: string;
  name: string;
}

interface CourseOption {
  id: string;
  name: string;
}

export default function CertificateEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isNewCertificate = params.id === "new";
  const [loading, setLoading] = useState(!isNewCertificate);
  const [saving, setSaving] = useState(false);
  const [participants, setParticipants] = useState<ParticipantOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [formData, setFormData] = useState({
    certificateNumber: "",
    name: "",
    issueDate: "",
    expiryDate: "",
    status: "Valid",
    participantId: "",
    courseId: "",
  });

  // Fetch certificate details if editing
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
        
        // Format dates for input fields
        const formattedData = {
          ...data,
          issueDate: data.issueDate.split('T')[0],
          expiryDate: data.expiryDate.split('T')[0],
          participantId: data.participant?.id || "",
          courseId: data.course?.id || "",
        };
        
        setFormData(formattedData);
      } catch (error) {
        console.error("Failed to fetch certificate:", error);
        toast.error("Failed to load certificate details");
      } finally {
        setLoading(false);
      }
    }

    // Fetch reference data (participants and courses)
    async function fetchReferenceData() {
      try {
        // Fetch participants
        const participantsResponse = await fetch("/api/participant");
        if (participantsResponse.ok) {
          const participantsData = await participantsResponse.json();
          setParticipants(participantsData.map((p: any) => ({
            id: p.id,
            name: p.full_name || p.name
          })));
        }

        // Fetch courses
        const coursesResponse = await fetch("/api/course");
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setCourses(coursesData.map((c: any) => ({
            id: c.id,
            name: c.course_name || c.name
          })));
        }
      } catch (error) {
        console.error("Failed to fetch reference data:", error);
        toast.error("Failed to load participants or courses");
      }
    }

    fetchReferenceData();
    
    if (!isNewCertificate) {
      fetchCertificate();
    } else {
      setLoading(false);
    }
  }, [params.id, router, isNewCertificate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate form data
      if (!formData.certificateNumber || !formData.name || !formData.issueDate || !formData.expiryDate) {
        toast.error("Please fill all required fields");
        setSaving(false);
        return;
      }

      // Prepare request
      const method = isNewCertificate ? "POST" : "PUT";
      const url = isNewCertificate 
        ? "/api/certificate" 
        : `/api/certificate/${params.id}`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      toast.success(isNewCertificate 
        ? "Certificate created successfully" 
        : "Certificate updated successfully"
      );
      
      // Redirect to certificate details or list page
      const data = await response.json();
      if (isNewCertificate) {
        router.push(`/certificate/${data.id}`);
      } else {
        router.push(`/certificate/${params.id}`);
      }
    } catch (error) {
      console.error("Failed to save certificate:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save certificate");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
              href={isNewCertificate ? "/certificate-expired" : `/certificate/${params.id}`}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </Link>
            <h1 className="text-xl font-semibold ml-2">
              {isNewCertificate ? "Create New Certificate" : "Edit Certificate"}
            </h1>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Certificate Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="certificateNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Certificate Number <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="certificateNumber"
                      name="certificateNumber"
                      value={formData.certificateNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      id="issueDate"
                      name="issueDate"
                      value={formData.issueDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Valid">Valid</option>
                      <option value="Expired">Expired</option>
                      <option value="Revoked">Revoked</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Related Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="participantId" className="block text-sm font-medium text-gray-700 mb-1">
                      Participant
                    </label>
                    <select
                      id="participantId"
                      name="participantId"
                      value={formData.participantId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Participant</option>
                      {participants.map((participant) => (
                        <option key={participant.id} value={participant.id}>
                          {participant.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">
                      Course
                    </label>
                    <select
                      id="courseId"
                      name="courseId"
                      value={formData.courseId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Link 
                href={isNewCertificate ? "/certificate-expired" : `/certificate/${params.id}`}
                className="px-4 py-2 mr-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Certificate</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
} 