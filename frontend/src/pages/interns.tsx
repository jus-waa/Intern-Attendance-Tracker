import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {Sun, CalendarDays, Clock, Download, Ellipsis} from "lucide-react";

  const Interns: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('CVSU');   
  const [currentPage, setCurrentPage] = useState(1);                          
  const [formData, setFormData] = useState({
    fullName: '',
    schoolName: '',
    schoolAbbreviation: '',
    shift: '',
    timeIn: '',
    timeOut: '',
    totalHours: '',
  });

  const interns = [
          {
            name: "Juan Dela Cruz",
            school: "Cavite State University - Main Campus",
            abbreviation: "CVSU",
            shift: "Day Shift",
            time: "8 AM - 5 PM",
            hours: "100/240 hours",
            isActive: true,
          },
          {
            name: "Maria Santos",
            school: "Cavite State University - Main Campus",
            abbreviation: "CVSU",
            shift: "Night Shift",
            time: "9 PM - 6 AM",
            hours: "210/240 hours",
            isActive: false,
          },
          {
            name: "Maria Santos",
            school: "Cavite State University - Main Campus",
            abbreviation: "CVSU",
            shift: "Night Shift",
            time: "9 PM - 6 AM",
            hours: "210/240 hours",
            isActive: false,
          },
          {
            name: "Maria Santos",
            school: "Cavite State University - Main Campus",
            abbreviation: "CVSU",
            shift: "Night Shift",
            time: "9 PM - 6 AM",
            hours: "210/240 hours",
            isActive: false,
          },
          {
            name: "Juan Dela Cruz",
            school: "Cavite State University - Main Campus",
            abbreviation: "CVSU",
            shift: "Day Shift",
            time: "8 AM - 5 PM",
            hours: "100/240 hours",
            isActive: true,
          },
          {
            name: "Juan Dela Cruz",
            school: "Cavite State University - Main Campus",
            abbreviation: "CVSU",
            shift: "Day Shift",
            time: "8 AM - 5 PM",
            hours: "100/240 hours",
            isActive: true,
          },
        ];

  const location = useLocation();
  useEffect(() => {
    if (location.state?.openModal) {
      setShowModal(true);
    }
  }, [location.state]);

  const [dateCreated, setDateCreated] = useState<string>('');

  const to12HourFormat = (time24: string) => {
    const [hourStr, minuteStr] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  useEffect(() => {
    if (showModal) {
      const now = new Date();
      setDateCreated(now.toISOString());
    }
  }, [showModal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'shift') {
      setFormData(prev => ({
        ...prev,
        shift: value,
        timeIn: '',
        timeOut: '',
      }));
      return;
    }

    if (name === 'timeIn') {
      setFormData(prev => ({ ...prev, timeIn: value }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const preventManualTimeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
  };

  const getTimeInRange = () => {
    switch (formData.shift) {
      case 'Day Shift':
        return { min: '06:00', max: '08:00' };
      case 'Mid Shift':
        return { min: '12:00', max: '15:00' };
      case 'Night Shift':
        return { min: '17:00', max: '20:00' };
      case 'Graveyard Shift':
        return { min: '22:00', max: '24:00' };
      default:
        return { min: '', max: '' };
    }
  };

  const handleTimeInBlur = () => {
    const { min, max } = getTimeInRange();
    const value = formData.timeIn;

    if (min && max && (value < min || value > max)) {
      alert(`Time In must be between ${to12HourFormat(min)} and ${to12HourFormat(max)} for the selected shift.`);
      setFormData(prev => ({ ...prev, timeIn: '', timeOut: '' }));
      return;
    }

    const [hour, minute] = value.split(':').map(Number);
    const timeInDate = new Date();
    timeInDate.setHours(hour, minute);
    timeInDate.setMinutes(timeInDate.getMinutes() + 540);
    const autoTimeOut = timeInDate.toTimeString().slice(0, 5);
    setFormData(prev => ({ ...prev, timeOut: autoTimeOut }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ ...formData, dateCreated });
    setShowModal(false);
    setFormData({
      fullName: '',
      schoolName: '',
      schoolAbbreviation: '',
      shift: '',
      timeIn: '',
      timeOut: '',
      totalHours: '',
    });
  };

  const { min: timeInMin, max: timeInMax } = getTimeInRange();
  const schools = ['CVSU', 'LSPU', 'NTC'];

    const itemsPerPage = 3;
    const totalPages = Math.ceil(interns.length / itemsPerPage);

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
          // Show all pages
          for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
          }
        } else {
          pageNumbers.push(1); // Always show first page

          if (currentPage > 3) {
            pageNumbers.push("..."); // Ellipsis before current
          }

          const startPage = Math.max(2, currentPage - 1);
          const endPage = Math.min(totalPages - 1, currentPage + 1);

          for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
          }

          if (currentPage < totalPages - 2) {
            pageNumbers.push("..."); // Ellipsis after current
          }

          pageNumbers.push(totalPages); // Always show last page
        }

        return pageNumbers;
      };

  return (
    <div className="flex flex-col items-center min-h-screen px-4 relative">
      <div className="w-full max-w-6xl">
      <div className="text-center mb-6">
        <p className="text-[#0D223D] text-4xl font-semibold mb-1">Intern Profile</p>
        <p className="text-[#969696] text-sm font-[400]">Manage your interns’ information</p>
    </div>
    <div className="p-6">

      {/*search and add button*/}
      <div className="w-full flex justify-end gap-2 mb-1">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 border rounded-full w-60 shadow-md focus:outline-none focus:ring-2"
          />
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#25E2CC] text-white px-6 py-2 rounded-xl font-semibold hover:bg-[#1eb5a3] flex items-center gap-2"
          >
            Add Intern
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

    {/* Main content */}
    {/* tab */}
<div className="w-full max-w-5xl mx-auto mt-10 relative">
    <div className="absolute -top-8 left-0 z-10 flex gap-2">
      {schools.map((school) => (
        <button
          key={school}
          onClick={() => setActiveTab(school)}
          className={`px-4 py-1.5 text-sm font-medium rounded-t-lg shadow-md border-b-0 mb-[-1px]
            ${
              activeTab === school
                ? "bg-white text-cyan-600 shadow-[0_-2px_6px_1px_rgba(0,0,0,0.04)] font-bold"
                : "font-normal bg-transparent text-gray-600 hover:text-cyan-600 border-transparent shadow-none"
            }`}
          style={{
            borderColor: activeTab === school ? "#e5e7eb" : "transparent",
          }}
        >
          {school}
        </button>
      ))}
    </div>

    {/* Intern Cards */}
    <div className="relative bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] rounded-tl-none rounded-2xl pt-2 pb-10 px-6 -mt-[1px] z-0">
      {activeTab === "CVSU" && (() => {
        

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedInterns = interns.slice(startIndex, endIndex);

        return paginatedInterns.map((intern, index) => (
          <div key={index} className="mt-4 flex justify-between items-center bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] rounded-lg p-4 mb-4 px-6">
            <div className="px-10px">
              <p className="font-bold text-[#0D223D] text-left">{intern.name}</p>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span className={`inline-block w-2 h-2 rounded-full ${intern.isActive ? "bg-green-500" : "bg-red-500"}`}></span>
                <span>{intern.isActive ? "Active" : "Inactive"}</span>
                <span>| {intern.school}</span>
                <span className="ml-1.5 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px]">{intern.abbreviation}</span>
              </div>
            </div>

            <div className="flex flex-col text-[14px] text-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Sun className="w-5 h-5 text-gray-600" />
                  <span>{intern.shift}</span>
                </div>
                <p>|</p>
                <div className="flex items-center gap-1">
                  <CalendarDays className="w-5 h-5 text-gray-600" />
                  <span>{intern.time}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-5 h-5 text-gray-600" />
                <span>{intern.hours}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex items-center text-sm text-gray-600 hover:text-cyan-600">
                <Download className="w-8 h-8" strokeWidth={1} />
              </button>
              <button className="flex items-center text-sm text-gray-600 hover:text-cyan-600">
                <Ellipsis className="w-8 h-8" strokeWidth={1} />
              </button>
            </div>
          </div>
        ));
      })()}

    </div>
    </div>


        {/*page number */}
        <div className="flex justify-center mt-4 gap-1">
          {getPageNumbers().map((page, index) =>
            page === "..." ? (
              <span key={index} className="px-2 text-gray-500">...</span>
            ) : (
              <button
                key={index}
                onClick={() => setCurrentPage(Number(page))}
                className={`px-3 py-1 rounded-full text-sm ${
                  currentPage === page
                    ? "bg-cyan-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>

        {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-xl relative">
            <h2 className="text-xl font-[650] mb-4 text-[#0D223D]">Add Intern</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required className="w-full border p-2 rounded" />
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-3">
                  <input type="text" name="schoolName" placeholder="School Name" value={formData.schoolName} onChange={handleChange} required className="w-full border p-2 rounded" />
                </div>
                <div className="col-span-1">
                  <input type="text" name="schoolAbbreviation" placeholder="Abbreviation" value={formData.schoolAbbreviation} onChange={handleChange} required className="w-full border p-2 rounded text-md" />
                </div>
              </div>
              <select name="shift" value={formData.shift} onChange={handleChange} required className="w-full border p-2 rounded">
                <option value="">Select Shift</option>
                <option>Day Shift</option>
                <option>Mid Shift</option>
                <option>Night Shift</option>
                <option>Graveyard Shift</option>
              </select>
              <div className="flex gap-2 text-gray-900">
                <div className="flex-1">
                  <label className="block text-sm font-medium">Time In</label>
                  <input type="time" name="timeIn" value={formData.timeIn} onChange={handleChange} onBlur={handleTimeInBlur} min={timeInMin} max={timeInMax} required className="w-full border p-2 rounded text-gray-900" />
                </div>
                <div className="flex-1 text-gray-900">
                  <label className="block text-sm font-medium">Time Out</label>
                  <input type="time" name="timeOut" value={formData.timeOut} onChange={handleChange} onKeyDown={preventManualTimeInput} required className="w-full border p-2 rounded text-gray-900" />
                </div>
              </div>
              <input type="number" name="totalHours" placeholder="Total Hours for Completion" value={formData.totalHours} onChange={handleChange} required className="w-full border p-2 rounded" />
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-[#25E2CC] text-white font-semibold px-4 py-2 rounded hover:bg-[#1eb5a3]">Submit</button>
              </div>
            </form>
          </div>
        </div>
        )}
        </div>
     </div>
    </div>
  );
};

export default Interns;
