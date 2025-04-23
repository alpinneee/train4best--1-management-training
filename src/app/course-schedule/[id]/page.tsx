"use client";

import React, { useState } from "react";
import Button from "@/components/common/button";
import { FileText, Edit, Trash2, History, UserCheck } from "lucide-react";
import Modal from "@/components/common/Modal";
import Layout from "@/components/common/Layout";

const CourseScheduleDetail = () => {
  const courseDetails = {
    className: "AIoT Class",
    date: "7 Feb 2024 - 10 Feb 2024",
    registrationDate: "1 Feb 2024",
    location: "Train4best",
    room: "Room 301",
    price: "Rp 2.500.000",
    totalParticipant: "25",
    totalPayment: "Rp 62.500.000",
  };

  const participants = [
    {
      no: 1,
      name: "Sandero Taeil Ishara",
      presentDay: "3 days",
      paymentStatus: "Unpaid",
    },
    {
      no: 2,
      name: "Mikael Ferdinand",
      presentDay: "5 days",
      paymentStatus: "Unpaid",
    },
  ];

  const [activeTab, setActiveTab] = useState("participant");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedCourse, setEditedCourse] = useState(courseDetails);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newParticipant, setNewParticipant] = useState({
    name: "",
    presentDay: "3 days",
    paymentStatus: "Unpaid",
  });
  const [isInstructureModalOpen, setIsInstructureModalOpen] = useState(false);
  const [newInstructure, setNewInstructure] = useState({
    name: "",
    role: "Instructor",
    status: "Active",
  });

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedCourse((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementasi logika update course schedule di sini
    setIsEditModalOpen(false);
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementasi logika penambahan partisipan di sini
    setIsModalOpen(false);
  };

  const handleAddInstructure = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementasi logika penambahan instructor di sini
    setIsInstructureModalOpen(false);
  };

  return (
    <Layout>
      <div className="p-2">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-lg md:text-xl text-gray-700">Course Schedule Detail</h1>
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
              <p className="text-gray-600 mb-1">Total Participant :</p>
              <p className="text-gray-600">Total Payment :</p>
            </div>
            <div className="text-xs sm:text-sm">
              <p className="text-gray-800 mb-1">{courseDetails.date}</p>
              <p className="text-gray-800 mb-1">{courseDetails.registrationDate}</p>
              <p className="text-gray-800 mb-1">{courseDetails.location}</p>
              <p className="text-gray-800 mb-1">{courseDetails.room}</p>
              <p className="text-gray-800 mb-1">{courseDetails.price}</p>
              <p className="text-gray-800 mb-1">{courseDetails.totalParticipant}</p>
              <p className="text-gray-800 mb-2">{courseDetails.totalPayment}</p>
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
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto text-xs"
              >
                Add Participant
              </Button>
              <input
                type="text"
                placeholder="Search..."
                className="w-full sm:w-auto px-2 py-1 text-xs border rounded-lg"
              />
            </div>

            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full bg-white rounded-lg shadow-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 text-xs text-gray-700">No</th>
                    <th className="text-left p-2 text-xs text-gray-700">Participant</th>
                    <th className="text-left p-2 text-xs text-gray-700">Present Day</th>
                    <th className="text-left p-2 text-xs text-gray-700">Payment Status</th>
                    <th className="text-left p-2 text-xs text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((participant) => (
                    <tr
                      key={participant.no}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-2 text-xs text-gray-700">{participant.no}</td>
                      <td className="p-2 text-xs text-gray-700">
                        <div className="flex items-center gap-1">
                          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                          {participant.name}
                        </div>
                      </td>
                      <td className="p-2 text-xs text-gray-700">{participant.presentDay}</td>
                      <td className="p-2 text-xs text-gray-700">{participant.paymentStatus}</td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <button
                            className="p-1 border rounded hover:bg-gray-100"
                            title="History"
                          >
                            <History size={14} className="text-gray-600" />
                          </button>
                          <button
                            className="p-1 border rounded hover:bg-gray-100"
                            title="Attendance"
                          >
                            <UserCheck size={14} className="text-gray-600" />
                          </button>
                          <button
                            className="p-1 border rounded hover:bg-gray-100"
                            title="Certificate"
                          >
                            <FileText size={14} className="text-gray-600" />
                          </button>
                          <button
                            className="p-1 border rounded hover:bg-gray-100"
                            title="Edit"
                          >
                            <Edit size={14} className="text-gray-600" />
                          </button>
                          <button
                            className="p-1 border rounded hover:bg-gray-100"
                            title="Delete"
                          >
                            <Trash2 size={14} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                onClick={() => setIsInstructureModalOpen(true)}
                className="w-full sm:w-auto text-xs"
              >
                Add Instructure
              </Button>
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
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-2 text-xs text-gray-700">1</td>
                    <td className="p-2 text-xs text-gray-700">Sandero Taeil Ishara</td>
                    <td className="p-2 text-xs text-gray-700">0895-1525-4981</td>
                    <td className="p-2 text-xs text-gray-700">Programming</td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <button className="flex items-center gap-1 text-xs text-gray-600">
                          <FileText size={14} /> Detail
                        </button>
                        <button className="flex items-center gap-1 text-xs text-red-500">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-2 text-xs text-gray-700">2</td>
                    <td className="p-2 text-xs text-gray-700">Silvana Introvert</td>
                    <td className="p-2 text-xs text-gray-700">0823-1765-3904</td>
                    <td className="p-2 text-xs text-gray-700">Programming</td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <button className="flex items-center gap-1 text-xs text-gray-600">
                          <FileText size={14} /> Detail
                        </button>
                        <button className="flex items-center gap-1 text-xs text-red-500">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
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
                  <label className="block text-xs text-gray-700 mb-1">Class Name</label>
                  <input
                    type="text"
                    name="className"
                    value={editedCourse.className}
                    onChange={handleEditInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs text-gray-700 mb-1">Date</label>
                  <input
                    type="text"
                    name="date"
                    value={editedCourse.date}
                    onChange={handleEditInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="DD MMM YYYY - DD MMM YYYY"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs text-gray-700 mb-1">Registration Date</label>
                  <input
                    type="text"
                    name="registrationDate"
                    value={editedCourse.registrationDate}
                    onChange={handleEditInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="DD MMM YYYY"
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
                    type="text"
                    name="price"
                    value={editedCourse.price}
                    onChange={handleEditInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
        {isModalOpen && (
          <Modal onClose={() => setIsModalOpen(false)}>
            <h2 className="text-base font-semibold mb-2 text-gray-700">Add Participant</h2>
            <form onSubmit={handleAddParticipant}>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Participant Name</label>
                  <input
                    type="text"
                    value={newParticipant.name}
                    onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Present Day</label>
                  <input
                    type="text"
                    value={newParticipant.presentDay}
                    className="w-full px-2 py-1 text-xs border rounded bg-gray-50"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Payment Status</label>
                  <input
                    type="text"
                    value={newParticipant.paymentStatus}
                    className="w-full px-2 py-1 text-xs border rounded bg-gray-50"
                    disabled
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  variant="gray"
                  size="small"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs px-2 py-1"
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  type="submit"
                  className="text-xs px-2 py-1"
                >
                  Save
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Add Instructure Modal */}
        {isInstructureModalOpen && (
          <Modal onClose={() => setIsInstructureModalOpen(false)}>
            <h2 className="text-base font-semibold mb-2 text-gray-700">Add Instructure</h2>
            <form onSubmit={handleAddInstructure}>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Instructure Name</label>
                  <input
                    type="text"
                    value={newInstructure.name}
                    onChange={(e) => setNewInstructure({ ...newInstructure, name: e.target.value })}
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Role</label>
                  <input
                    type="text"
                    value={newInstructure.role}
                    className="w-full px-2 py-1 text-xs border rounded bg-gray-50"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Status</label>
                  <input
                    type="text"
                    value={newInstructure.status}
                    className="w-full px-2 py-1 text-xs border rounded bg-gray-50"
                    disabled
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  variant="gray"
                  size="small"
                  onClick={() => setIsInstructureModalOpen(false)}
                  className="text-xs px-2 py-1"
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  type="submit"
                  className="text-xs px-2 py-1"
                >
                  Save
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </Layout>
  );
};

export default CourseScheduleDetail;
