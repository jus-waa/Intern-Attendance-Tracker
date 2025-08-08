import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { useLocation } from 'react-router-dom';
import {Sun, CalendarDays, Clock, Download, Ellipsis, Search} from "lucide-react";

type Intern = {
  intern_id: string;
  intern_name: string;
  abbreviation: string;
  school_name: string;
  shift_name: string;
  time_in: string;
  time_out: string;
  total_hours: number;
  time_remain: number;
  status: string;
  created_at: string;
  updated_at: string;
};

const Interns: React.FC = () => {
  const [showAddInternModal, setAddInternModal] = useState(false);
  const [showEditModal, setEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('CVSU');   
  const [currentPage, setCurrentPage] = useState(1);  
  const [actionMenuIndex, setActionMenuIndex] = useState<number | null>(null);  
  const activeMenuRef = useRef<HTMLDivElement | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null); 
  const statusOptions = ['Active', 'Completed', 'Terminated'];
  const [formData, setFormData] = useState({
    intern_name: '',
    school_name: '',
    abbreviation: '',
    shift_name: '',
    time_in: '',
    time_out: '',
    total_hours: '',
    time_remain: '',
    status: "Active",
  });
  //time_remain = total_hours
  useEffect(() => {
  setFormData(prev => ({
      ...prev,
      time_remain: prev.total_hours // mirror value
    }));
  }, [formData.total_hours]);
  //call for intern table
  const [interns, setInterns] = useState<Intern[]>([])
  useEffect(() => {
    const fetchInterns = async () => {
      try {
        const response = await axios.get('http://localhost:8000/intern/list');
        setInterns(response.data.result);
      } catch (error) {
        console.error('Error fetching interns:', error);
      }
    };

    fetchInterns();
  }, []);
  
  const location = useLocation();
  useEffect(() => {
    if (location.state?.openModal) {
      setAddInternModal(true);
    }
  }, [location.state]);

  const to12HourFormat = (time24: string) => {
    const [hourStr, minuteStr] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  // Handle Add Intern
  const [response, setResponse] = useState<{ uuid: string; qr_code_path: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "total_hours") {
      const hours = parseInt(value);
      const formatted = `${hours.toString().padStart(2, "0")}:00:00`;
    
      setFormData({
        ...formData,
        total_hours: formatted,
        time_remain: formatted, // mirror total_hours
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    console.log("Submitting form data:", formData);
    // create a copy of formData
    const dataToSend = { ...formData };
      
    // convert number hours to HH:MM:SS
    if (typeof dataToSend.total_hours === "number") {
      dataToSend.total_hours = convertHoursToHHMMSS(dataToSend.total_hours);
    }
    if (typeof dataToSend.time_remain === "number") {
      dataToSend.time_remain = convertHoursToHHMMSS(dataToSend.time_remain);
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/intern/register", formData);
      console.log("Response: ", res.data);
      window.location.reload();
      //setResponse(res.data.result);
    } catch (err: any) {
      console.error("Error", err.response?.data || err.message);
      //setError(err.response?.data?.detail || "Registration failed.");
    }
  };
  const convertHoursToHHMMSS = (hours: number): string => {
    const h = String(Math.floor(hours)).padStart(2, '0');
    return `${h}:00:00`;
  };

  //Manual Time Input
  const preventManualTimeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
  };

  const getTimeInRange = () => {
    switch (formData.shift_name) {
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
    const value = formData.time_in;

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

  const { min: timeInMin, max: timeInMax } = getTimeInRange();
  const schools = ['CVSU', 'LSPU', 'NTC'];

  const itemsPerPage = 3;
  const totalPages = Math.ceil(interns.length / itemsPerPage);

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1); // Always show first
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
      pageNumbers.push(totalPages); // Always show last
    }
    return pageNumbers;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeMenuRef.current &&
        !activeMenuRef.current.contains(event.target as Node)
      ) {
        setActionMenuIndex(null);
      }
    };
    if (actionMenuIndex !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [actionMenuIndex]);

  return (
    <div className="flex flex-col items-center min-h-screen px-4 relative">
      <div className="w-full max-w-6xl">
        {/*Header*/}
        <div className="text-center py-2">
          <p className="text-[#0D223D] text-4xl font-semibold mb-1">Intern Profile</p>
          <p className="text-[#969696] text-sm font-[400]">Manage your interns’ information</p>
        </div>
        <div className="py-4">
          {/*Search and Add button*/}
          <div className="w-full flex justify-end items-center gap-2 mb-1 text-sm border-2 border-violet-500">
            {/*Search*/}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="font-xs px-4 py-2 border rounded-full w-64 shadow-md focus:outline-none focus:ring-2"
              />
              <Search className="w-5 h-5 text-gray-600 absolute right-3 top-1/2 transform -translate-y-1/2"/>
            </div>
            {/*Add Intern*/}
            <button
              onClick={() => setAddInternModal(true)}
              className="bg-[#25E2CC] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#1eb5a3] flex items-center gap-2"
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
          {/* Schools (Abbreviation) */}
          <div className="w-full mt-10 relative drop-shadow-xl">
            <div className="absolute -top-8 left-0 z-10 flex gap-2">
              {schools.map((school) => (
                <button
                  key={school}
                  onClick={() => setActiveTab(school)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-t-lg shadow-[0_-2px_6px_1px_rgba(0,0,0,0.04)] border-b-0 mb-[-1px]
                    ${
                      activeTab === school
                        ? "bg-white text-cyan-600  font-bold "
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
            {/* Interns Table*/}
            <div className="relative bg-white border-2 border-red-500 shadow-[0_2px_8px_rgba(0,0,0,0.1)] rounded-tl-none rounded-2xl px-4 z-0 overflow-visible">
              {(() => {
                const filteredInterns = interns.filter(
                  (intern) => intern.abbreviation === "CvSU"
                );
                if (filteredInterns.length === 0) {
                  return (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-300 text-lg font-normal p-5">No existing intern.</p>
                    </div>
                  );
                }
                {/* Inner Content */}
                return interns.map((intern, index) => (
                  <div key={intern.intern_id} className="mt-4 flex justify-between items-center bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] rounded-lg p-4 mb-4 px-6 border-2 border-green-500">
                    {/* Intern per line */}
                    <div className="px-10 border-2 border-blue-500">
                      <p className="font-bold text-[#0D223D] text-left">{intern.intern_name}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <span className={"mt-0.5 w-2 h-2 rounded-full bg-green-500"}></span>
                        <span>Active</span>
                        <span>| {intern.school_name}</span>
                        <span className="ml-1.5 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px]">{intern.abbreviation}</span>
                      </div>
                    </div>
                    {/* Shift name, time in, time out, time remain, total hours */}
                    <div className="flex flex-col text-[14px] text-gray-600 border-2 border-yellow-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Sun className="w-5 h-5 text-gray-600" />
                          <span>{intern.shift_name}</span>
                        </div>
                        <p>|</p>
                        <div className="flex items-center gap-1">
                          <CalendarDays className="w-5 h-5 text-gray-600" />
                          <span>{intern.time_in} - {intern.time_out}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <span>{intern.time_remain}/{intern.total_hours} hours</span>
                      </div>
                    </div>
                    {/* Download and Actions */}
                    <div className="flex gap-3 relative border-2 border-violet-500">
                      {/* Download */}
                      <button className="flex items-center text-sm text-gray-600 hover:text-cyan-600">
                        <Download className="w-8 h-8" strokeWidth={1} />
                      </button>
                      {/* Actions */}
                      <div className="relative">
                        <button className="flex items-center text-sm text-gray-600 hover:text-cyan-600"
                          onClick={() => setActionMenuIndex(actionMenuIndex === index ? null : index)}>
                          <Ellipsis className="w-8 h-8" strokeWidth={1} />
                          {/*Action menu modal*/}
                          {actionMenuIndex === index && (
                            <div
                              ref={activeMenuRef} // Attach ref here
                              className="absolute top-10 left-0 bg-white border shadow-lg rounded-lg w-40 z-50"
                            >
                              <button
                                onClick={() => {setEditModal(true)
                                  console.log("Edit intern:", intern.intern_name); 
                                  setActionMenuIndex(null);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                console.log("Delete intern:", intern.intern_name);
                                setSelectedIntern(intern); 
                                setShowDeleteModal(true);  
                                setActionMenuIndex(null);  
                              }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
          {/* End Intern Table */}
          {/* Pagination */}
          <div className="w-full flex justify-end mt-5 border-2 border-pink-500">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded border ${
                  currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-200'
                }`}
              >
                &lt;
              </button>
              {getPageNumbers().map((page, index) =>
                typeof page === "number" ? (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded border ${
                      currentPage === page
                        ? 'bg-[#25E2CC] text-white font-semibold'
                        : 'hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={index} className="px-2 text-gray-500 select-none">
                    ...
                  </span>
                )
              )}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded border ${
                  currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-200'
                }`}
              >
                &gt;
              </button>
            </div>
          </div>
          {/* Add Intern Modal */}
          {showAddInternModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-xl relative">
              <h2 className="text-xl font-[650] mb-4 text-[#0D223D]">Add Intern</h2>
              {/* Form Start */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Intern Name */}
                <input type="text" name="intern_name" placeholder="Intern Name" value={formData.intern_name} onChange={handleChange} required className="w-full border p-2 rounded" />
                {/* School Name and its Abbreviation */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-3">
                    <input type="text" name="school_name" placeholder="School Name" value={formData.school_name} onChange={handleChange} required className="w-full border p-2 rounded" />
                  </div>
                  <div className="col-span-1">
                    <input type="text" name="abbreviation" placeholder="Abbreviation" value={formData.abbreviation} onChange={handleChange} required className="w-full border p-2 rounded text-md" />
                  </div>
                </div>
                {/* Shift Name */}
                <select name="shift_name" value={formData.shift_name} onChange={handleChange} required className="w-full border p-2 rounded">
                  <option value="">Select Shift</option>
                  <option value="Day Shift">Day Shift</option>
                  <option value="Mid Shift">Mid Shift</option>
                  <option value="Night Shift">Night Shift</option>
                  <option value="Graveyard Shift">Graveyard Shift</option>
                </select>
                {/* Time In and Time Out */}
                <div className="flex gap-2 text-gray-900">
                  <div className="flex-1">  
                    <label className="block text-sm font-medium">Time In</label>
                    <input type="time" name="time_in" value={formData.time_in} onChange={handleChange} onBlur={handleTimeInBlur} min={timeInMin} max={timeInMax} required className="w-full border p-2 rounded text-gray-900" />
                  </div>
                  <div className="flex-1 text-gray-900">
                    <label className="block text-sm font-medium">Time Out</label>
                    <input type="time" name="time_out" value={formData.time_out} onChange={handleChange} required className="w-full border p-2 rounded text-gray-900" />
                  </div>
                </div>
                {/* Total Hours */}
                <input type="number" name="total_hours" placeholder="Total Hours for Completion" value={formData.total_hours} onChange={handleChange} required className="w-full border p-2 rounded" />
                {/* Status (auto Active so its hidden) */}
                <input type="text" name="status" placeholder="Status" value="Active" onChange={handleChange} hidden className="w-full border p-2 rounded" />
                {/* Submit and Cancel */}
                <div className="flex justify-end gap-2 mt-6">
                  <button type="submit" className="bg-[#25E2CC] text-white font-semibold px-4 py-2 rounded hover:bg-[#1eb5a3]">Submit</button>
                  <button type="button" onClick={() => setAddInternModal(false)} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Cancel</button>
                </div>
              </form>
              {response?.qr_code_path && (                
                <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded">
                  <p><strong>Intern Registered!</strong></p>
                  <p>UUID: {response.uuid}</p>
                  <p className="font-semibold">QR Code:</p>
                  <img
                    src={`http://localhost:8000${response.qr_code_path}`}
                    alt="Intern QR Code"
                    className="w-48 h-48 border mt-2"
                  /> {/* <img src={response.qr_code_path} alt="QR Code" /> */}
                </div>
              )}
              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded text-red-700">
                  {error}
                </div>
              )}
            </div>
          </div>
          )}
          {/* Edit Intern Modal */}
          {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-xl relative">
              <h2 className="text-xl font-[650] mb-4 text-[#0D223D]">Edit Intern Details</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="InternName" placeholder="Intern Name" value={formData.intern_name} onChange={handleChange} required className="w-full border p-2 rounded" />
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-3">
                    <input type="text" name="schoolName" placeholder="School Name" value={formData.school_name} onChange={handleChange} required className="w-full border p-2 rounded" />
                  </div>
                  <div className="col-span-1">
                    <input type="text" name="schoolAbbreviation" placeholder="Abbreviation" value={formData.abbreviation} onChange={handleChange} required className="w-full border p-2 rounded text-md" />
                  </div>
                </div>
                <select name="shift" value={formData.shift_name} onChange={handleChange} required className="w-full border p-2 rounded">
                  <option value="">Select Shift</option>
                  <option>Day Shift</option>
                  <option>Mid Shift</option>
                  <option>Night Shift</option>
                  <option>Graveyard Shift</option>
                </select>
                <div className="flex gap-2 text-gray-900">
                  <div className="flex-1">
                    <label className="block text-sm font-medium">Time In</label>
                    <input type="time" name="timeIn" value={formData.time_in} onChange={handleChange} onBlur={handleTimeInBlur} min={timeInMin} max={timeInMax} required className="w-full border p-2 rounded text-gray-900" />
                  </div>
                  <div className="flex-1 text-gray-900">
                    <label className="block text-sm font-medium">Time Out</label>
                    <input type="time" name="timeOut" value={formData.time_out} onChange={handleChange} onKeyDown={preventManualTimeInput} required className="w-full border p-2 rounded text-gray-900" />
                  </div>
                </div>
                <div className="flex gap-2 text-gray-900">
                  <div className="flex-1">
                    <input type="number" name="totalHours" value={formData.total_hours} onChange={handleChange} placeholder='Total Hours for Completion:'required className="w-full border p-2 rounded text-gray-900" />
                  </div>
                <div className="flex gap-2 text-gray-900">
                  <div className="flex-1">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="w-full border p-2 rounded bg-white text-left"
                    >
                      <option value="" disabled hidden>
                        Select Status
                      </option>
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button type="button" onClick={() => setEditModal(false)} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Cancel</button>
                  <button type="submit" className="bg-[#25E2CC] text-white font-semibold px-4 py-2 rounded hover:bg-[#1eb5a3]">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
          )}
          {/*Delete Modal*/}
          {showDeleteModal && selectedIntern && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md">
                <h2 className="text-lg font-semibold mb-4 text-center">
                  Are you sure you want to delete this intern profile?
                </h2>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      console.log("Delete intern:", selectedIntern);
                      // You can add your actual delete logic here (e.g., API call)
                      setShowDeleteModal(false);
                      setSelectedIntern(null);
                    }}
                    className="px-4 py-2 rounded-md hover:bg-[#7c1b1b] text-white bg-red-500 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Interns;