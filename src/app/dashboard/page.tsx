"use client";

import React from "react";
import Card from "@/components/common/card";
import Layout from "@/components/common/Layout";
import Calendar from "react-calendar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "react-calendar/dist/Calendar.css";
import {
  UserGroupIcon,
  UsersIcon,
  AcademicCapIcon,
  DocumentCheckIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const trainingData = [
  { name: "Jan", value: 15 },
  { name: "Feb", value: 20 },
  { name: "Mar", value: 25 },
  { name: "Apr", value: 18 },
  { name: "May", value: 30 },
  { name: "Jun", value: 22 },
  { name: "Jul", value: 35 },
  { name: "Aug", value: 28 },
  { name: "Sep", value: 32 },
  { name: "Oct", value: 40 },
  { name: "Nov", value: 38 },
  { name: "Dec", value: 45 },
];

const certificationTypeData = [
  { name: "Basic Training", value: 45 },
  { name: "Advanced Training", value: 30 },
  { name: "Professional Training", value: 25 },
];

const COLORS = ["#4338ca", "#fb923c", "#fbbf24"];

export default function Dashboard() {
  const upcomingTrainings = [
    {
      title: "Basic Web Development",
      date: "2024-03-25",
      trainer: "John Doe",
    },
    {
      title: "Advanced React", 
      date: "2024-03-28",
      trainer: "Jane Smith",
    },
    {
      title: "Cloud Computing",
      date: "2024-04-01", 
      trainer: "Mike Johnsonn",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <Layout>
      <motion.div
        className="p-4" // Reduced padding
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          variants={itemVariants}
          className="flex justify-between items-center mb-4" // Reduced margin
        >
          <h1 className="text-xl font-bold text-gray-700"> {/* Reduced text size */}
            Training Dashboard
          </h1>
          <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"> {/* Reduced text and gap */}
            Refresh Data
          </button>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6" // Reduced gap and margin
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Card className="p-4 bg-blue-50"> {/* Reduced padding */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1"> {/* Reduced gap and margin */}
                  <UserGroupIcon className="w-6 h-6 text-blue-600" /> {/* Reduced icon size */}
                  <span className="text-2xl font-bold text-blue-700">22</span> {/* Reduced text size */}
                </div>
                <span className="text-sm text-blue-600">Active Trainers</span> {/* Reduced text size */}
              </div>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="p-4 bg-green-50">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <UsersIcon className="w-6 h-6 text-green-600" />
                  <span className="text-2xl font-bold text-green-700">156</span>
                </div>
                <span className="text-sm text-green-600">Active Participants</span>
              </div>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="p-4 bg-purple-50">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <AcademicCapIcon className="w-6 h-6 text-purple-600" />
                  <span className="text-2xl font-bold text-purple-700">15</span>
                </div>
                <span className="text-sm text-purple-600">Ongoing Training</span>
              </div>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="p-4 bg-orange-50">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <DocumentCheckIcon className="w-6 h-6 text-orange-600" />
                  <span className="text-2xl font-bold text-orange-700">289</span>
                </div>
                <span className="text-sm text-orange-600">Certificates Issued</span>
              </div>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="p-4 bg-red-50">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpenIcon className="w-6 h-6 text-red-600" />
                  <span className="text-2xl font-bold text-red-700">8</span>
                </div>
                <span className="text-sm text-red-600">Training Programs</span>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-4" // Reduced gap
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Card className="p-4"> {/* Reduced padding */}
              <h2 className="text-lg font-bold mb-2 text-gray-700"> {/* Reduced text size */}
                Monthly Training Statistics
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={trainingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4338ca" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-4">
              <h2 className="text-lg font-bold text-gray-700 mb-3">
                Training Calendar
              </h2>
              <div className="calendar-container">
                <Calendar className="w-full border-none shadow-none text-black text-sm" /> {/* Added text-sm */}
              </div>
              <div className="mt-3"> {/* Reduced margin */}
                <h3 className="font-semibold text-gray-700 mb-2 text-sm">
                  Upcoming Trainings:
                </h3>
                <div className="space-y-1"> {/* Reduced spacing */}
                  {upcomingTrainings.map((training, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded">
                      <div className="font-medium text-gray-700 text-sm">
                        {training.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {training.date} - {training.trainer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-4">
              <h2 className="text-lg font-bold text-gray-700">
                Training Type Distribution
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={certificationTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {certificationTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </Layout>
  );
}
