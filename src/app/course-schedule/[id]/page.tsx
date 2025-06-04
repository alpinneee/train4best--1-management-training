"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/common/button";
import { FileText, Edit, Trash2, History, UserCheck } from "lucide-react";
import Modal from "@/components/common/Modal";
import Layout from "@/components/common/Layout";
import Image from "next/image";
import InstructorSelectionTable from "../../../components/common/InstructorSelectionTable";

interface Participant {
  id: string;
  name: string;
  participantId: string;
  presentDay: string;
  paymentStatus: string;
  regStatus: string;
}

interface Instructure {
  id: string;
  name: string;
  instructureId: string;
  phoneNumber: string;
  profiency: string;
  photo: string;
}

interface AvailableParticipant {
  id: string;
  name: string;
}

interface AvailableInstructure {
  id: string;
  full_name: string;
  phone_number: string;
  profiency: string;
}

interface CourseSchedule {
  id: string;
  className: string;
  date: string;
  registrationDate: string;
  location: string;
  room: string;
  price: number;
  quota: number;
  status: string;
  courseId: string;
  participants: Participant[];
  instructures: Instructure[];
  // Raw data for edit form
  startDate: string;
  endDate: string;
  startRegDate: string;
  endRegDate: string;
  durationDay: number;
}

const CourseScheduleDetail = () => {
  const params = useParams() as { id: string };
  const router = useRouter();
  const scheduleId = params.id;

  const [courseDetails, setCourseDetails] = useState<CourseSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("participant");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [isInstructureModalOpen, setIsInstructureModalOpen] = useState(false);
  const [availableParticipants, setAvailableParticipants] = useState<AvailableParticipant[]>([]);
  const [availableInstructures, setAvailableInstructures] = useState<AvailableInstructure[]>([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState("");
  const [selectedInstructureId, setSelectedInstructureId] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"participant" | "instructure" | null>(null);
  
  const [editedCourse, setEditedCourse] = useState({
    courseId: '',
    startDate: '',
    endDate: '',
    startRegDate: '',
    endRegDate: '',
    location: '',
    room: '',
    price: '',
    quota: '',
    durationDay: '',
    status: 'Active'
  });

  const [isInstructorSelectionModalOpen, setIsInstructorSelectionModalOpen] = useState(false);
  const [selectedInstructorIds, setSelectedInstructorIds] = useState<string[]>([]);
  const [allInstructors, setAllInstructors] = useState<any[]>([]);

  const searchParticipants = async (query: string) => {
    try {
      const response = await fetch(`/api/participant?search=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      const data = await response.json();
      return data.data.map((participant: any) => ({
        id: participant.id,
        name: participant.name
      }));
    } catch (error) {
      console.error("Error searching participants:", error);
      return [];
    }
  };

  const searchInstructures = async (query: string) => {
    try {
      const response = await fetch(`/api/instructure?search=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      const data = await response.json();
      return data.data.map((instructure: any) => ({
        id: instructure.id,
        full_name: instructure.name,
        phone_number: instructure.phone_number,
        profiency: instructure.profiency
      }));
    } catch (error) {
      console.error("Error searching instructures:", error);
      return [];
    }
  };

  const fetchCourseSchedule = async () => {
    setLoading(true);
    try {
      console.log(`Fetching schedule with ID: ${scheduleId}`);
      const response = await fetch(`/api/course-schedule/${scheduleId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error(`API error: ${response.status}`, errorData);
        throw new Error(`Server responded with ${response.status}: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('Schedule data received successfully');
      setCourseDetails(data);
      
      // Initialize edit form with current values
      setEditedCourse({
        courseId: data.courseId,
        startDate: new Date(data.startDate).toISOString().split('T')[0],
        endDate: new Date(data.endDate).toISOString().split('T')[0],
        startRegDate: new Date(data.startRegDate).toISOString().split('T')[0],
        endRegDate: new Date(data.endRegDate).toISOString().split('T')[0],
        location: data.location,
        room: data.room,
        price: data.price.toString(),
        quota: data.quota.toString(),
        durationDay: data.durationDay.toString(),
        status: data.status
      });

      if (data.instructures) {
        setSelectedInstructorIds(data.instructures.map((instructor: { instructureId: string }) => instructor.instructureId));
      }
    } catch (err) {
      console.error('Error in fetchCourseSchedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to load course schedule');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllInstructors = async () => {
    try {
      const response = await fetch('/api/instructure');
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      const data = await response.json();
      
      // Transform the data to match the Instructor interface
      const instructors = data.data.map((instructor: {
        id: string;
        name: string;
        phone_number?: string;
        profiency?: string;
      }) => ({
        id: instructor.id,
        full_name: instructor.name,
        phone_number: instructor.phone_number || '',
        profiency: instructor.profiency || '',
      }));
      
      setAllInstructors(instructors);
    } catch (error) {
      console.error("Error fetching instructors:", error);
    }
  };

  useEffect(() => {
    fetchCourseSchedule();
    fetchAllInstructors();
  }, [scheduleId]);

  useEffect(() => {
    if (courseDetails?.instructures) {
      setSelectedInstructorIds(courseDetails.instructures.map((instructor: { instructureId: string }) => instructor.instructureId));
    }
  }, [courseDetails]);

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedCourse((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/course-schedule/${scheduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedCourse),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update schedule');
      }
      
      // Refresh data and close modal
      fetchCourseSchedule();
      setIsEditModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleParticipantSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    if (query.length > 1) {
      const results = await searchParticipants(query);
      setAvailableParticipants(results);
    } else {
      setAvailableParticipants([]);
    }
  };

  const handleInstructureSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    if (query.length > 1) {
      const results = await searchInstructures(query);
      setAvailableInstructures(results);
    } else {
      setAvailableInstructures([]);
    }
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipantId) {
      alert('Please select a participant');
      return;
    }

    try {
      const response = await fetch(`/api/course-schedule/${scheduleId}/participant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantId: selectedParticipantId }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add participant');
      }
      
      // Refresh data and close modal
      fetchCourseSchedule();
      setIsParticipantModalOpen(false);
      setSelectedParticipantId('');
      setAvailableParticipants([]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleAddInstructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstructureId) {
      alert('Please select an instructor');
      return;
    }

    try {
      const response = await fetch(`/api/course-schedule/${scheduleId}/instructure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instructureId: selectedInstructureId }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add instructor');
      }
      
      // Refresh data and close modal
      fetchCourseSchedule();
      setIsInstructureModalOpen(false);
      setSelectedInstructureId('');
      setAvailableInstructures([]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const openDeleteModal = (id: string, type: "participant" | "instructure") => {
    setSelectedItemId(id);
    setDeleteType(type);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItemId || !deleteType) return;

    try {
      let response;
      if (deleteType === "participant") {
        response = await fetch(`/api/course-schedule/${scheduleId}/participant?registrationId=${selectedItemId}`, {
          method: 'DELETE',
        });
      } else {
        response = await fetch(`/api/course-schedule/${scheduleId}/instructure?assignmentId=${selectedItemId}`, {
          method: 'DELETE',
        });
      }
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to remove ${deleteType}`);
      }
      
      // Refresh data and close modal
      fetchCourseSchedule();
      setIsDeleteModalOpen(false);
      setSelectedItemId(null);
      setDeleteType(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleSelectInstructor = async (instructorId: string) => {
    try {
      const response = await fetch(`/api/course-schedule/${scheduleId}/instructure`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instructureId: instructorId,
        }),
      });

      if (response.ok) {
        setSelectedInstructorIds(prev => [...prev, instructorId]);
        // Update the course schedule to reflect the change
        fetchCourseSchedule();
      } else {
        console.error("Failed to add instructor");
      }
    } catch (error) {
      console.error("Error adding instructor:", error);
    }
  };

  const handleRemoveInstructor = async (instructorId: string) => {
    try {
      const response = await fetch(`/api/course-schedule/${scheduleId}/instructure/${instructorId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSelectedInstructorIds(prev => prev.filter(id => id !== instructorId));
        // Update the course schedule to reflect the change
        fetchCourseSchedule();
      } else {
        console.error("Failed to remove instructor");
      }
    } catch (error) {
      console.error("Error removing instructor:", error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-2">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
          <Button
            variant="primary"
            size="small"
            onClick={() => router.push('/course-schedule')}
            className="text-xs px-2 py-1"
          >
            Back to Schedules
          </Button>
        </div>
      </Layout>
    );
  }

  if (!courseDetails) {
    return (
      <Layout>
        <div className="p-2">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded mb-4">
            Course schedule not found
          </div>
          <Button
            variant="primary"
            size="small"
            onClick={() => router.push('/course-schedule')}
            className="text-xs px-2 py-1"
          >
            Back to Schedules
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout variant="admin">
      <div className="p-2">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-lg md:text-xl text-gray-700">Course Schedule Detail</h1>
          <Button
            variant="gray"
            size="small"
            onClick={() => router.push('/course-schedule')}
            className="text-xs px-2 py-1"
          >
            Back
          </Button>
        </div>

        {/* Course Details Card */}
        <div className="bg-gray-50 p-3 rounded-lg mb-3">
          <h2 className="text-base md:text-lg text-gray-700 mb-2">
            {courseDetails.className}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="text-xs sm:text-sm">
              <p className="text-gray-600 mb-1">Date :</p>
              <p className="text-gray-600 mb-1">Registration Date :</p>
              <p className="text-gray-600 mb-1">Location :</p>
              <p className="text-gray-600 mb-1">Room :</p>
              <p className="text-gray-600 mb-1">Price :</p>
              <p className="text-gray-600 mb-1">Quota :</p>
              <p className="text-gray-600 mb-1">Status :</p>
            </div>
            <div className="text-xs sm:text-sm">
              <p className="text-gray-800 mb-1">{courseDetails.date}</p>
              <p className="text-gray-800 mb-1">{courseDetails.registrationDate}</p>
              <p className="text-gray-800 mb-1">{courseDetails.location}</p>
              <p className="text-gray-800 mb-1">{courseDetails.room}</p>
              <p className="text-gray-800 mb-1">Rp {courseDetails.price.toLocaleString('id-ID')}</p>
              <p className="text-gray-800 mb-1">{courseDetails.quota} participants</p>
              <p className="text-gray-800 mb-2">
                <span className={`px-2 py-1 rounded-full ${
                  courseDetails.status === 'Active' ? 'bg-green-100 text-green-800' : 
                  courseDetails.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 
                  courseDetails.status === 'Canceled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {courseDetails.status}
                </span>
              </p>
              <Button
                className="w-full sm:w-auto text-xs float-right"
                variant="green"
                size="small"
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit Schedule
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-3">
          <button
            className={`px-3 py-2 text-center flex-1 text-xs ${
              activeTab === "participant"
                ? "bg-blue-700 text-white"
                : "bg-gray-100 text-gray-600"
            } rounded-l-lg`}
            onClick={() => setActiveTab("participant")}
          >
            Participant
          </button>
          <button
            className={`px-3 py-2 flex-1 text-xs ${
              activeTab === "instructure"
                ? "bg-blue-700 text-white"
                : "bg-gray-100 text-gray-600"
            } rounded-r-lg`}
            onClick={() => setActiveTab("instructure")}
          >
            Instructure
          </button>
        </div>

        {/* Participant List */}
        {activeTab === "participant" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-2">
              <Button
                variant="primary"
                size="small"
                onClick={() => setIsParticipantModalOpen(true)}
                className="w-full sm:w-auto text-xs"
              >
                Add Participant
              </Button>
              <div className="text-xs text-gray-600">
                {courseDetails.participants.length} Participants
              </div>
            </div>

            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full bg-white rounded-lg shadow-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 text-xs text-gray-700">No</th>
                    <th className="text-left p-2 text-xs text-gray-700">Participant</th>
                    <th className="text-left p-2 text-xs text-gray-700">Present</th>
                    <th className="text-left p-2 text-xs text-gray-700">Payment Status</th>
                    <th className="text-left p-2 text-xs text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {courseDetails.participants.length > 0 ? (
                    courseDetails.participants.map((participant, index) => (
                      <tr
                        key={participant.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-2 text-xs text-gray-700">{index + 1}</td>
                        <td className="p-2 text-xs text-gray-700">
                          <div className="flex items-center gap-1">
                            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                            {participant.name}
                          </div>
                        </td>
                        <td className="p-2 text-xs text-gray-700">{participant.presentDay}</td>
                        <td className="p-2 text-xs text-gray-700">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            participant.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 
                            participant.paymentStatus === 'Partial' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {participant.paymentStatus}
                          </span>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            <button
                              className="p-1 border rounded hover:bg-gray-100"
                              title="Delete"
                              onClick={() => openDeleteModal(participant.id, "participant")}
                            >
                              <Trash2 size={14} className="text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500 text-xs">
                        No participants found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Instructure Tab Content */}
        {activeTab === "instructure" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-2">
              <Button
                variant="primary"
                size="small"
                onClick={() => setIsInstructorSelectionModalOpen(true)}
                className="w-full sm:w-auto text-xs"
              >
                Manage Instructors
              </Button>
              <div className="text-xs text-gray-600">
                {courseDetails.instructures.length} Instructors
              </div>
            </div>

            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full bg-white rounded-lg shadow-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 text-xs text-gray-700">NO</th>
                    <th className="text-left p-2 text-xs text-gray-700">Full Name</th>
                    <th className="text-left p-2 text-xs text-gray-700">Phone Number</th>
                    <th className="text-left p-2 text-xs text-gray-700">Profiency</th>
                    <th className="text-left p-2 text-xs text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {courseDetails.instructures.length > 0 ? (
                    courseDetails.instructures.map((instructure, index) => (
                      <tr key={instructure.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 text-xs text-gray-700">{index + 1}</td>
                        <td className="p-2 text-xs text-gray-700">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden">
                              <Image
                                src={instructure.photo || "/default-avatar.png"}
                                alt={instructure.name}
                                width={24}
                                height={24}
                                className="object-cover"
                              />
                            </div>
                            {instructure.name}
                          </div>
                        </td>
                        <td className="p-2 text-xs text-gray-700">{instructure.phoneNumber}</td>
                        <td className="p-2 text-xs text-gray-700">{instructure.profiency}</td>
                        <td className="p-2">
                          <button
                            className="flex items-center gap-1 text-xs text-red-500"
                            onClick={() => openDeleteModal(instructure.id, "instructure")}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500 text-xs">
                        No instructors found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit Schedule Modal */}
        {isEditModalOpen && (
          <Modal onClose={() => setIsEditModalOpen(false)}>
            <h2 className="text-base font-semibold mb-2 text-gray-700">Edit Course Schedule</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="mb-2">
                  <label className="block text-xs text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={editedCourse.status}
                    onChange={handleEditInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label className="block text-xs text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={editedCourse.startDate}
                    onChange={handleEditInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={editedCourse.endDate}
                    onChange={handleEditInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs text-gray-700 mb-1">Registration Start Date</label>
                  <input
                    type="date"
                    name="startRegDate"
                    value={editedCourse.startRegDate}
                    onChange={handleEditInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs text-gray-700 mb-1">Registration End Date</label>
                  <input
                    type="date"
                    name="endRegDate"
                    value={editedCourse.endRegDate}
                    onChange={handleEditInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={editedCourse.location}
                    onChange={handleEditInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs text-gray-700 mb-1">Room</label>
                  <input
                    type="text"
                    name="room"
                    value={editedCourse.room}
                    onChange={handleEditInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={editedCourse.price}
                    onChange={handleEditInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs text-gray-700 mb-1">Quota</label>
                  <input
                    type="number"
                    name="quota"
                    value={editedCourse.quota}
                    onChange={handleEditInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs text-gray-700 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    name="durationDay"
                    value={editedCourse.durationDay}
                    onChange={handleEditInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  variant="gray"
                  size="small"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-xs px-2 py-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="green"
                  size="small"
                  type="submit"
                  className="text-xs px-2 py-1"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Add Participant Modal */}
        {isParticipantModalOpen && (
          <Modal onClose={() => {
            setIsParticipantModalOpen(false);
            setAvailableParticipants([]);
            setSelectedParticipantId("");
          }}>
            <h2 className="text-base font-semibold mb-2 text-gray-700">Add Participant</h2>
            <form onSubmit={handleAddParticipant}>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Search Participant</label>
                  <input
                    type="text"
                    placeholder="Type to search..."
                    onChange={handleParticipantSearch}
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                {availableParticipants.length > 0 && (
                  <div className="max-h-40 overflow-y-auto border rounded">
                    {availableParticipants.map((participant) => (
                      <div
                        key={participant.id}
                        className={`p-2 text-xs hover:bg-gray-100 cursor-pointer ${
                          selectedParticipantId === participant.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedParticipantId(participant.id)}
                      >
                        {participant.name}
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedParticipantId && (
                  <div className="p-2 border rounded bg-gray-50">
                    <p className="text-xs font-medium">Selected Participant:</p>
                    <p className="text-xs">{availableParticipants.find(p => p.id === selectedParticipantId)?.name}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  variant="gray"
                  size="small"
                  onClick={() => {
                    setIsParticipantModalOpen(false);
                    setAvailableParticipants([]);
                    setSelectedParticipantId("");
                  }}
                  className="text-xs px-2 py-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  type="submit"
                  disabled={!selectedParticipantId}
                  className={`text-xs px-2 py-1 ${!selectedParticipantId ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Add
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Instructor Selection Modal */}
        {isInstructorSelectionModalOpen && (
          <Modal 
            onClose={() => setIsInstructorSelectionModalOpen(false)}
          >
            <h2 className="text-base font-semibold mb-4 text-gray-700">Manage Instructors</h2>
            <InstructorSelectionTable 
              instructors={allInstructors}
              selectedInstructors={selectedInstructorIds}
              onSelectInstructor={handleSelectInstructor}
              onRemoveInstructor={handleRemoveInstructor}
            />
            <div className="flex justify-end mt-4">
              <Button
                variant="primary"
                size="small"
                onClick={() => setIsInstructorSelectionModalOpen(false)}
                className="text-xs px-4 py-1"
              >
                Done
              </Button>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && deleteType && (
          <Modal onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedItemId(null);
            setDeleteType(null);
          }}>
            <h2 className="text-base font-semibold text-gray-700">Confirm Delete</h2>
            <p className="text-xs text-gray-600 mt-2">
              Are you sure you want to remove this {deleteType}?
            </p>
            <div className="flex justify-end gap-2 mt-2">
              <Button
                variant="gray"
                size="small"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedItemId(null);
                  setDeleteType(null);
                }}
                className="text-xs px-2 py-1"
              >
                Cancel
              </Button>
              <Button
                variant="red"
                size="small"
                onClick={handleDeleteConfirm}
                className="text-xs px-2 py-1"
              >
                Delete
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
};

export default CourseScheduleDetail;
