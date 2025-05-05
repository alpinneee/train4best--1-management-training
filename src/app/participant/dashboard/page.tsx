"use client";

import { useState } from "react";
import Layout from "@/components/common/Layout";
import { 
  BookOpen, 
  FileText, 
  CreditCard, 
  Calendar, 
  Clock, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface Course {
  id: number;
  name: string;
  progress: number;
  nextSession: string;
  status: "active" | "completed" | "upcoming";
}

interface Certificate {
  id: number;
  courseName: string;
  issueDate: string;
  expiryDate: string;
  status: "valid" | "expired" | "expiring";
}

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("courses");

  const courses: Course[] = [
    {
      id: 1,
      name: "AIoT Fundamentals",
      progress: 75,
      nextSession: "2024-03-15",
      status: "active"
    },
    {
      id: 2,
      name: "Web Development",
      progress: 100,
      nextSession: "2024-02-20",
      status: "completed"
    },
    {
      id: 3,
      name: "Data Science",
      progress: 0,
      nextSession: "2024-04-01",
      status: "upcoming"
    }
  ];

  const certificates: Certificate[] = [
    {
      id: 1,
      courseName: "Web Development",
      issueDate: "2024-02-20",
      expiryDate: "2025-02-20",
      status: "valid"
    },
    {
      id: 2,
      courseName: "AIoT Fundamentals",
      issueDate: "2023-12-15",
      expiryDate: "2024-12-15",
      status: "expiring"
    }
  ];

  const stats = [
    {
      title: "Active Courses",
      value: "2",
      icon: <BookOpen className="w-5 h-5" />,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Certificates",
      value: "2",
      icon: <FileText className="w-5 h-5" />,
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Pending Payments",
      value: "1",
      icon: <CreditCard className="w-5 h-5" />,
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      title: "Upcoming Sessions",
      value: "2",
      icon: <Calendar className="w-5 h-5" />,
      color: "bg-purple-100 text-purple-600"
    }
  ];

  return (
    <Layout variant="participant">
      <div className="p-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-700">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-full ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("courses")}
                className={`py-3 px-4 text-sm font-medium ${
                  activeTab === "courses"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                My Courses
              </button>
              <button
                onClick={() => setActiveTab("certificates")}
                className={`py-3 px-4 text-sm font-medium ${
                  activeTab === "certificates"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Certificates
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === "courses" && (
              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-700">{course.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Clock className="w-4 h-4" />
                          <span>Next session: {course.nextSession}</span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        course.status === "active" 
                          ? "bg-green-100 text-green-600"
                          : course.status === "completed"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}>
                        {course.status}
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "certificates" && (
              <div className="space-y-4">
                {certificates.map((cert) => (
                  <div key={cert.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-700">{cert.courseName}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Calendar className="w-4 h-4" />
                          <span>Issued: {cert.issueDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Calendar className="w-4 h-4" />
                          <span>Expires: {cert.expiryDate}</span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        cert.status === "valid"
                          ? "bg-green-100 text-green-600"
                          : cert.status === "expiring"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-red-100 text-red-600"
                      }`}>
                        {cert.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-medium mb-3 text-gray-700">Important Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Payment Due</p>
                <p className="text-xs text-gray-500">Payment for Data Science course is due in 3 days</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Certificate Available</p>
                <p className="text-xs text-gray-500">Your Web Development certificate is ready to download</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
