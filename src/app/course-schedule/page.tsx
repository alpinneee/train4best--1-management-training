'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from "@/components/common/Layout";
import Button from '@/components/common/button'
import Modal from '@/components/common/Modal'
import Table from "@/components/common/table";

interface Column<T> {
  header: string;
  accessor: keyof T | ((data: T) => React.ReactNode);
  className?: string;
}

interface Schedule {
  no: number;
  className: string;
  date: string;
  location: string;
}

const CourseSchedulePage = () => {
  const router = useRouter()

  const schedules = [
    { no: 1, className: 'AIoT', date: '7 Feb 2024 - 10 Feb 2024', location: 'Train4best' },
    { no: 2, className: 'Programming', date: '10 Feb 2024 - 13 Feb 2024', location: 'Train4best' },
  ]

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [newSchedule, setNewSchedule] = useState({
    className: '',
    date: '',
    location: '',
    registrationDate: '',
    room: '',
    price: '',
    totalParticipant: '',
    totalPayment: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewSchedule(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalOpen(false)
    setNewSchedule({
      className: '',
      date: '',
      location: '',
      registrationDate: '',
      room: '',
      price: '',
      totalParticipant: '',
      totalPayment: ''
    })
  }

  const handleDetailClick = (id: number) => {
    router.push(`/course-schedule/${id}`)
  }

  const columns: Column<Schedule>[] = [
    { 
      header: "No", 
      accessor: "no",
      className: "w-12 text-center"
    },
    { 
      header: "Class Name", 
      accessor: (data: Schedule) => (
        <span className="text-xs">{data.className}</span>
      ),
      className: "min-w-[120px]"
    },
    { 
      header: "Date", 
      accessor: (data: Schedule) => (
        <span className="text-xs">{data.date}</span>
      ),
      className: "min-w-[150px]"
    },
    { 
      header: "Location", 
      accessor: (data: Schedule) => (
        <span className="text-xs">{data.location}</span>
      ),
      className: "min-w-[100px]"
    },
    {
      header: "Action",
      accessor: (schedule: Schedule) => (
        <div className="flex gap-1 justify-center">
          <button
            onClick={() => handleDetailClick(schedule.no)}
            className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1"
          >
            Detail
          </button>
          <button 
            className="text-red-500 hover:text-red-700 text-xs px-2 py-1" 
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete
          </button>
        </div>
      ),
      className: "w-24 text-center"
    },
  ];

  return (
    <Layout>
      <div className="p-2">
        <h1 className="text-lg md:text-xl text-gray-700 mb-2">Course Schedule</h1>
        
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-2">
          <div>
            <Button 
              variant="primary" 
              size="small"
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto text-xs"
            >
              Add New course Schedule
            </Button>
          </div>
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full sm:w-auto px-2 py-1 text-xs border rounded-lg"
          />
        </div>

        <div className="overflow-x-auto -mx-2 px-2">
          <Table
            columns={columns}
            data={schedules}
            currentPage={1}
            totalPages={1}
            itemsPerPage={5}
            totalItems={schedules.length}
            onPageChange={() => {}}
          />
        </div>

        {/* Add Schedule Modal */}
        {isModalOpen && (
          <Modal onClose={() => setIsModalOpen(false)}>
            <h2 className="text-base font-semibold mb-2 text-gray-700">Add New Schedule</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="mb-2">
                  <label className="block text-xs text-gray-700 mb-1">Class Name</label>
                  <input
                    type="text"
                    name="className"
                    value={newSchedule.className}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs text-gray-700 mb-1">Date</label>
                  <input
                    type="date" 
                    name="date"
                    value={newSchedule.date}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs text-gray-700 mb-1">Registration Date</label>
                  <input
                    type="date"
                    name="registrationDate"
                    value={newSchedule.registrationDate}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={newSchedule.location}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs text-gray-700 mb-1">Room</label>
                  <input
                    type="text"
                    name="room"
                    value={newSchedule.room}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={newSchedule.price}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
                    min="0"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs text-gray-700 mb-1">Total Participant</label>
                  <input
                    type="number"
                    name="totalParticipant"
                    value={newSchedule.totalParticipant}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
                    min="1"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs text-gray-700 mb-1">Total Payment</label>
                  <input
                    type="number"
                    name="totalPayment"
                    value={newSchedule.totalPayment}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
                    min="0"
                    required
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
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  type="submit"
                  className="text-xs px-2 py-1"
                >
                  Add Schedule
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Delete Modal */}
        {isDeleteModalOpen && (
          <Modal onClose={() => setIsDeleteModalOpen(false)}>
            <h2 className="text-base font-semibold text-gray-700">Delete Schedule</h2>
            <p className="text-xs text-gray-600 mt-2">Are you sure you want to delete this schedule?</p>
            <div className="flex justify-end mt-2">
              <Button 
                variant="red" 
                size="small"
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-xs px-2 py-1"
              >
                Delete
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  )
}

export default CourseSchedulePage 