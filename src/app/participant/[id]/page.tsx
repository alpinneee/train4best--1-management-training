"use client";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "@/components/common/Navbar";
import Sidebar from "@/components/common/Sidebar";

interface Participant {
  id: string;
  full_name: string;
  photo?: string;
  job_title?: string;
  phone_number: string;
  email?: string;
  username?: string;
}

const ParticipantDetail = () => {
  const params = useParams();
  const id = params.id as string;
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const fetchParticipant = async () => {
      try {
        const response = await fetch(`/api/participant/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch participant details');
        }
        
        const data = await response.json();
        setParticipant(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchParticipant();
    }
  }, [id]);

  const handleMobileOpen = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onMobileMenuClick={handleMobileOpen} />
      <div className="flex flex-1">
        <Sidebar 
          isMobileOpen={isMobileOpen} 
          onMobileClose={handleMobileOpen} 
          variant="participant" 
        />
        <main className="flex-1 p-6 bg-green-50">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg">{error}</div>
          ) : participant ? (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h1 className="text-xl text-gray-600 mb-4">Profile Participant</h1>

                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  {/* Profile Image and Name */}
                  <div className="flex items-center gap-4">
                    <Image
                      src={participant.photo || "/profile-placeholder.jpg"}
                      alt="Profile"
                      width={80}
                      height={80}
                      className="rounded-full"
                    />
                    <div>
                      <h2 className="text-lg font-medium text-gray-700">{participant.full_name}</h2>
                      <p className="text-gray-500">{participant.job_title || 'Participant'}</p>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="md:ml-8">
                    <h3 className="text-gray-600 mb-2">Contact Detail</h3>
                    <div className="space-y-2">
                      {participant.email && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="text-gray-600">📧</span>
                          <span>{participant.email}</span>
                        </div>
                      )}
                      {participant.username && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="text-gray-600">@</span>
                          <span>{participant.username}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="text-gray-600">📱</span>
                        <span>{participant.phone_number}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex overflow-x-auto gap-6 border-b">
                <Link
                  href={`/participant/dashboard`}
                  className="pb-2 whitespace-nowrap text-gray-600 border-b-2 border-gray-600"
                >
                  Dashboard
                </Link>
                <Link
                  href={`/participant/my-course`}
                  className="pb-2 whitespace-nowrap text-gray-500 hover:text-gray-700"
                >
                  My Courses
                </Link>
                <Link
                  href={`/participant/my-certificate`}
                  className="pb-2 whitespace-nowrap text-gray-500 hover:text-gray-700"
                >
                  Certificates
                </Link>
                <Link 
                  href={`/participant/payment`} 
                  className="pb-2 whitespace-nowrap text-gray-500 hover:text-gray-700"
                >
                  Payments
                </Link>
              </div>

              {/* Content Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Enrolled Courses */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h2 className="text-gray-600 mb-4">Enrolled Courses</h2>
                  <p className="text-sm text-gray-500">View all your enrolled courses in the My Courses section.</p>
                </div>

                {/* Training in Progress */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h2 className="text-gray-600 mb-4">Training In Progress</h2>
                  <div className="space-y-4">
                    {/* Progress bars */}
                    <div className="space-y-2">
                      <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-blue-600 rounded-full"></div>
                      </div>
                      <div className="h-2 bg-red-200 rounded-full overflow-hidden">
                        <div className="h-full w-1/2 bg-red-600 rounded-full"></div>
                      </div>
                      <div className="h-2 bg-yellow-200 rounded-full overflow-hidden">
                        <div className="h-full w-4/5 bg-yellow-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">
              Participant not found
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ParticipantDetail;
