"use client";

import Image from "next/image";
import { Eye, PenSquare, Trash2 } from "lucide-react";
import { useState } from "react";
import Pagination from "@/components/common/Pagination";
import Button from "@/components/common/button";
import Modal from "@/components/common/Modal";
import Card from "@/components/common/card";
import Layout from "@/components/common/Layout";

interface CourseType {
  id: number;
  name: string;
  image: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export default function CourseType() {
  const courseTypes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'preview'>('add');
  const [selectedCourseType, setSelectedCourseType] = useState<CourseType | null>(null);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(courseTypes.length / itemsPerPage);

  const handleEdit = (courseType: number) => {
    setSelectedCourseType({
      id: courseType,
      name: 'Online',
      image: courseType % 2 === 0 ? "/code.jpg" : "/aiot.jpg",
      createdAt: '01 Januari 2024',
      status: 'active'
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handlePreview = (courseType: number) => {
    setSelectedCourseType({
      id: courseType,
      name: 'Online',
      image: courseType % 2 === 0 ? "/code.jpg" : "/aiot.jpg",
      createdAt: '01 Januari 2024',
      status: 'active'
    });
    setModalMode('preview');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourseType(null);
    setModalMode('add');
  };

  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return courseTypes.slice(indexOfFirstItem, indexOfLastItem);
  };

  const renderModalContent = () => {
    switch (modalMode) {
      case 'preview':
        return (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-700">Detail Course Type</h2>
            <div className="relative h-48 w-full rounded-lg overflow-hidden">
              <Image
                src={selectedCourseType?.image || "/code.jpg"}
                alt="Course Type Preview"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-2">
              <div>
                <h3 className="text-xs font-medium text-gray-500">Nama Course Type</h3>
                <p className="text-sm text-gray-700">{selectedCourseType?.name}</p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-gray-500">Tanggal Dibuat</h3>
                <p className="text-sm text-gray-700">{selectedCourseType?.createdAt}</p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-gray-500">Status</h3>
                <span className="inline-block px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                  {selectedCourseType?.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                variant="gray"
                size="small"
                onClick={handleCloseModal}
                className="text-xs px-3 py-1"
              >
                Tutup
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <>
            <h2 className="text-base font-semibold mb-2 text-gray-700">
              {modalMode === 'add' ? 'Add New Course Type' : 'Edit Course Type'}
            </h2>
            <form className="space-y-2">
              <div>
                <label className="block text-xs text-gray-700 mb-1">Course Type Name</label>
                <input
                  type="text"
                  placeholder="Enter course type name"
                  defaultValue={modalMode === 'edit' ? 'Online' : ''}
                  className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Image</label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors duration-200"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500">Pilih atau seret file Anda ke sini</p>
                  </div>
                  <input 
                    id="image-upload"
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Handle file upload logic here
                        console.log('File selected:', file);
                      }
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="gray"
                  size="small"
                  onClick={handleCloseModal}
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
                  {modalMode === 'add' ? 'Submit' : 'Update'}
                </Button>
              </div>
            </form>
          </>
        );
    }
  };

  return (
    <Layout>
      <div className="p-2">
        <h1 className="text-lg md:text-xl text-gray-600 mb-2">
          Course Type
        </h1>

        <div className="mb-2">
          <Button
            variant="primary"
            size="small"
            onClick={() => {
              setModalMode('add');
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto text-xs"
          >
            Add Course Type
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {getCurrentItems().map((item) => (
            <div
              key={item}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <Card>
                <div className="relative h-32 w-full">
                  <Image
                    src={item % 2 === 0 ? "/code.jpg" : "/aiot.jpg"}
                    alt="Course Type"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-2">
                  <p className="text-xs text-gray-700 mb-2">Course Type : Online</p>
                  <div className="flex justify-between">
                    <button 
                      className="text-gray-600 p-1"
                      onClick={() => handlePreview(item)}
                    >
                      <Eye size={14} />
                    </button>
                    <div className="flex gap-1">
                      <button 
                        className="text-gray-600 p-1"
                        onClick={() => handleEdit(item)}
                      >
                        <PenSquare size={14} />
                      </button>
                      <button className="text-red-500 p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        <div className="mt-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {isModalOpen && (
        <Modal onClose={handleCloseModal}>
          {renderModalContent()}
        </Modal>
      )}
    </Layout>
  );
}
