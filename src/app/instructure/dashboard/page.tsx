"use client";

import { useState } from "react";
import Layout from "@/components/common/Layout";
import { 
  BookOpen, 
  Users, 
  Clock, 
  Calendar,
  AlertCircle,
  GraduationCap,
  MessageSquare
} from "lucide-react";

interface TeachingCourse {
  id: number;
  name: string;
  students: number;
  nextSession: string;
  status: "active" | "completed" | "upcoming";
}

interface StudentProgress {
  id: number;
  name: string;
  course: string;
  progress: number;
  lastActive: string;
}

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("courses");

  const teachingCourses: TeachingCourse[] = [
    {
      id: 1,
      name: "AIoT Fundamentals",
      students: 25,
      nextSession: "2024-03-15",
      status: "active"
    },
    {
      id: 2,
      name: "Web Development",
      students: 30,
      nextSession: "2024-02-20",
      status: "completed"
    },
    {
      id: 3,
      name: "Data Science",
      students: 20,
      nextSession: "2024-04-01",
      status: "upcoming"
    }
  ];

  const studentProgress: StudentProgress[] = [
    {
      id: 1,
      name: "John Doe",
      course: "AIoT Fundamentals",
      progress: 75,
      lastActive: "2024-03-10"
    },
    {
      id: 2,
      name: "Jane Smith",
      course: "Web Development",
      progress: 90,
      lastActive: "2024-03-11"
    }
  ];

  const stats = [
    {
      title: "Total Students",
      value: "75",
      icon: <Users className="w-5 h-5" />,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Active Courses",
      value: "3",
      icon: <BookOpen className="w-5 h-5" />,
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Upcoming Sessions",
      value: "2",
      icon: <Calendar className="w-5 h-5" />,
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      title: "Pending Reviews",
      value: "5",
      icon: <GraduationCap className="w-5 h-5" />,
      color: "bg-purple-100 text-purple-600"
    }
  ];

  return (
    <Layout variant="instructure">
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
                Teaching Courses
              </button>
              <button
                onClick={() => setActiveTab("students")}
                className={`py-3 px-4 text-sm font-medium ${
                  activeTab === "students"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Student Progress
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === "courses" && (
              <div className="space-y-4">
                {teachingCourses.map((course) => (
                  <div key={course.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-700">{course.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Users className="w-4 h-4" />
                          <span>{course.students} Students</span>
                        </div>
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
                  </div>
                ))}
              </div>
            )}

            {activeTab === "students" && (
              <div className="space-y-4">
                {studentProgress.map((student) => (
                  <div key={student.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-700">{student.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{student.course}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Clock className="w-4 h-4" />
                          <span>Last active: {student.lastActive}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-700">{student.progress}%</div>
                        <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
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
                <p className="text-sm font-medium text-gray-700">Assignment Review Needed</p>
                <p className="text-xs text-gray-500">5 assignments from AIoT Fundamentals need your review</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">New Student Questions</p>
                <p className="text-xs text-gray-500">3 new questions from Web Development students</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;

