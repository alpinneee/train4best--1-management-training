"use client";

import React, { useState } from "react";
import Image from "next/image";
import Navbar from "@/components/common/Navbar";
import Sidebar from "@/components/common/Sidebar";

const courses = [
  {
    id: 1,
    name: "AIoT",
    type: "Online",
    description: [
      "Membangun sistem AIoT",
      "Mengembangkan aplikasi smart home, smart agriculture, smart healthcare",
    ],
    image: "/aiot.jpg",
  },
  {
    id: 2,
    name: "Programmer",
    type: "Online",
    description: ["introduction (pengenalan web)", "Frontend, backend"],
    image: "/programmer.jpg",
  },
  {
    id: 3,
    name: "AIoT",
    type: "Online",
    description: [
      "Membangun sistem AIoT",
      "Mengembangkan aplikasi smart home, smart agriculture, smart healthcare",
    ],
    image: "/aiot.jpg",
  },
  {
    id: 4,
    name: "Programmer",
    type: "Online",
    description: ["introduction (pengenalan web)", "Frontend, backend"],
    image: "/programmer.jpg",
  },
];

const DashboardPage = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleMobileOpen = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onMobileMenuClick={handleMobileOpen} />
      <div className="flex flex-1">
      <Sidebar isMobileOpen={isMobileOpen} onMobileClose={handleMobileOpen} variant="participant" />
        <main className="flex-1 p-6 bg-green-50">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
            <h1 className="text-2xl font-semibold text-gray-600 mb-2 sm:mb-0">
              Courses
            </h1>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-gray-700 border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-300"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-5 h-5 text-gray-400"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow p-4 flex flex-col"
              >
                <div className="h-32 w-full relative mb-2">
                  <Image
                    src={course.image}
                    alt={course.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="mb-2">
                    <div className="font-semibold text-sm">
                      Course Name : {course.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      Course Type : {course.type}
                    </div>
                    <div className="text-xs mt-1">
                      <span className="font-semibold">Description :</span>
                      <ul className="list-disc ml-4">
                        {course.description.map((desc, idx) => (
                          <li key={idx}>{desc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-auto pt-2">
                    <span className="text-gray-400">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                    </span>
                    <span className="text-gray-400">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h4l2-2 2 2h4a2 2 0 012 2v12a2 2 0 01-2 2z"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination */}
          <div className="flex justify-center items-center mt-8 gap-2">
            <button className="p-1 rounded hover:bg-gray-200" disabled>
              {"<<"}
            </button>
            <button className="p-1 rounded hover:bg-gray-200" disabled>
              {"<"}
            </button>
            <button className="px-3 py-1 rounded bg-gray-300 text-gray-700 font-semibold">
              1
            </button>
            <button className="p-1 rounded hover:bg-gray-200">2</button>
            <button className="p-1 rounded hover:bg-gray-200">3</button>
            <button className="p-1 rounded hover:bg-gray-200">{">"}</button>
            <button className="p-1 rounded hover:bg-gray-200">{" >>"}</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
