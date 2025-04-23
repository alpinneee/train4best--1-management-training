"use client";

import Image from "next/image";
import { Eye, PenSquare, Trash2 } from "lucide-react";
import { useState } from "react";
import Pagination from "@/components/common/Pagination";
import Button from "@/components/common/button";
import Modal from "@/components/common/Modal";
import Card from "@/components/common/card";
import Layout from "@/components/common/Layout";

export default function CourseType() {
  const courseTypes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(courseTypes.length / itemsPerPage);

  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return courseTypes.slice(indexOfFirstItem, indexOfLastItem);
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
            onClick={() => setIsModalOpen(true)}
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
                    <button className="text-gray-600 p-1">
                      <Eye size={14} />
                    </button>
                    <div className="flex gap-1">
                      <button className="text-gray-600 p-1">
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
        <Modal onClose={() => setIsModalOpen(false)}>
          <h2 className="text-base font-semibold mb-2 text-gray-700">Add New Course Type</h2>
          <form className="space-y-2">
            <div>
              <label className="block text-xs text-gray-700 mb-1">Course Type Name</label>
              <input
                type="text"
                placeholder="Enter course type name"
                className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2">
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
                Submit
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
