import React, { useState, useRef, useEffect } from "react";
import { Ellipsis, ChevronDown, Calendar } from "lucide-react";
import SearchComponent from "../components/search"; 
import Pagination from "../components/pagination"; 
import ExportButton from "../components/exportbutton"; 
import CalendarComponent from "../components/calendar"; 
import axios from "axios";
import SchoolDropdown from "../components/schools"; 

type Attendance = {
  attendance_id: string;
  intern_id: string;
  attendance_date: string;
  intern_name: string;
  time_in: string;
  time_out: string;
  total_hours: string;
  check_in: string;
  remarks: string;
  updated_at: string;
  abbreviation: string;
};

const InternAttendanceData: Attendance[] = [
  {
    attendance_id: "",
    intern_id: "",
    attendance_date: "",
    intern_name: "",
    time_in: "",
    time_out: "",
    total_hours: "",
    check_in: "",
    remarks: "",
    updated_at: "",
    abbreviation: ""
  }
];

const TimeTable = () => {
  const [data, setData] = useState<Attendance[]>(InternAttendanceData);
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showEditModal, setEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState<Attendance | null>(null);  
  const [editRemarks, setEditRemarks] = useState("");
  const [actionMenuIndex, setActionMenuIndex] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const calendarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        !target.closest(".action-button")
      ) {
        setActionMenuIndex(null);
      }
     
      if (
        calendarRef.current &&
        !calendarRef.current.contains(target) &&
        !target.closest(".calendar-button")
      ) {
        setIsCalendarOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch attendance data based on selected date or all data
  const fetchAttendance = async (targetDate?: Date) => {
    try {
      setLoading(true);
      let response;
      
      if (targetDate) {
        // Format date as YYYY-MM-DD for the API (avoid timezone issues)
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        console.log('Selected date:', targetDate);
        console.log('Formatted date for API:', formattedDate);
        
        response = await axios.get(`http://localhost:8000/attendance/timesheet/by-date?target_date=${formattedDate}`);
      } else {
        // Fetch all attendance data
        response = await axios.get("http://localhost:8000/attendance/timesheet");
      }
      
      setAttendanceData(response.data.result);
      setLoading(false);
      console.log(response.data);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
      setLoading(false);
      // If no data found for specific date, you might want to show empty state
      if (targetDate) {
        setAttendanceData([]);
      }
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAttendance();
  }, []);

  // Fetch data when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchAttendance(selectedDate);
    } else {
      // If no date selected, fetch all data
      fetchAttendance();
    }
  }, [selectedDate]);

  // Use attendanceData for filtering (now filtered by date on backend)
  const filteredData = attendanceData
    .filter((intern) => 
      intern.abbreviation.toLowerCase() === activeTab.toLowerCase()
    )
    .filter(
      (intern) =>
        intern.intern_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intern.check_in.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intern.attendance_date.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to first page when search term or selected date changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDate]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setActionMenuIndex(null); // Close any open action menus
  };

  const formatSelectedDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const handleActionButtonClick = (event: React.MouseEvent, index: number) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setActionMenuIndex(actionMenuIndex === index ? null : index);
    setDropdownPosition({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
    });
  };

  const handleEdit = (intern: Attendance) => {
    setSelectedIntern(intern);
    setEditRemarks(intern.remarks);
    setEditModal(true);
  };

  const saveEditChanges = async () => {
    if (!selectedIntern) return;
   
    try {
      const payload = {
        intern_id: selectedIntern.intern_id,
        remarks: editRemarks || undefined
      };
     
      const response = await fetch("http://localhost:8000/attendance/timesheet/edit", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
     
      if (!response.ok) {
        const errorData = await response.json();
        console.log("Server error details:", errorData);
        throw new Error(errorData.detail || "Failed to update attendance");
      }
     
      // Update both data states after success
      const updateData = (prevData: Attendance[]) =>
        prevData.map((item) =>
          item.intern_id === selectedIntern.intern_id
            ? { ...item, remarks: editRemarks }
            : item
        );
      
      setData(updateData);
      setAttendanceData(updateData);
     
      setEditModal(false);
      setSelectedIntern(null);
      setEditRemarks("");
    } catch (error: any) {
      console.error("Error updating attendance:", error.message);
    }
  };

  const handleDelete = async (intern_id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/attendance/timesheet/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },    
        body: JSON.stringify({ intern_id }),
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete attendance");
      }
    
      // Remove deleted item from your state (attendanceData or data)
      setAttendanceData((prev) =>
        prev.filter((item) => item.intern_id !== intern_id)
      );
    
      // Also close the delete modal & reset selectedIntern
      setShowDeleteModal(false);
      setSelectedIntern(null);
    } catch (error: any) {
      console.error("Error deleting attendance:", error.message);
    }
  };

  // Format date from "2025-08-12T00:00:00" → "Aug 12, 2025"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };    

  // Format time from "2025-08-12T14:15:34.000236" → "02:15:34 PM"
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };    

  // Convert seconds string to "HH:MM:SS.mmm"
  const formatDuration = (secondsStr: string) => {
    const seconds = parseFloat(secondsStr);
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = (seconds % 60).toFixed(2); // keep milliseconds
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.padStart(6, "0")}`;
  };

  // Clear date filter function
  const clearDateFilter = () => {
    setSelectedDate(null);
  };

  return (
    <div className="min-h-screen">
      <div className="flex flex-col">
        <div className="text-center mb-6">
          <p className="text-[#0D223D] text-4xl font-semibold mb-1">
            Attendance
          </p>
          <p className="text-[#969696] text-sm font-[400]">
            Manage your interns' attendance.
          </p>
        </div>
        <div className="bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <SearchComponent
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search..."
              width="w-80"
            />
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <SchoolDropdown
                  data={attendanceData}
                  activeSchool={activeTab}
                  onSchoolChange={setActiveTab}
                />
                <div className="relative" ref={calendarRef}>
                  <button
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    className="calendar-button border border-gray-200 rounded-2xl px-4 py-2 text-sm focus:ring-1 focus:ring-teal-500 shadow-md flex items-center space-x-2 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">
                      {selectedDate ? formatSelectedDate(selectedDate) : 'Select Date'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </button>
                 
                  {isCalendarOpen && (
                    <div className="absolute right-0 mt-2 z-50">
                      <CalendarComponent
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        onClose={() => setIsCalendarOpen(false)}
                      />
                    </div>
                  )}
                </div>
                
                {/* Clear date filter button */}
                {selectedDate && (
                  <button
                    onClick={clearDateFilter}
                    className="border border-gray-200 rounded-2xl px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Clear Date
                  </button>
                )}
              </div>
              <div className="relative" ref={dropdownRef}>
                <ExportButton
                   data={filteredData.map((row, i) => ({ ...row, id: i + 1 }))}
                  headers={[
                    "ID",
                    "Name",
                    "University",
                    "Date",
                    "Time In",
                    "Time Out",
                    "Total Hours",
                    "Status",
                    "Remarks",
                  ]}
                  filename="attendance_report"
                  title="Attendance Report"
                  formatRowData={(row) => [
                    row.id,
                    row.intern_name,
                    row.abbreviation,
                    row.attendance_date,
                    row.time_in,
                    row.time_out,
                    row.total_hours,
                    row.check_in,
                    row.remarks,
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="mx-6 rounded-3xl shadow-sm border border-gray-200 overflow-hidden bg-white p-8">
            <div className="text-center text-gray-500">Loading attendance data...</div>
          </div>
        ) : (
          <div className="mx-6 rounded-3xl shadow-sm border border-gray-200 overflow-hidden bg-white">
            {filteredData.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No attendance records found{selectedDate && ` for ${formatSelectedDate(selectedDate)}`}.
              </div>
            ) : (
              <table className="min-w-full text-sm text-left text-gray-700 table-auto">
                <thead className="bg-white text-gray-600 border-b">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Intern Name</th>
                    <th className="px-4 py-3 text-center">University</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Time in</th>
                    <th className="px-4 py-3">Time out</th>
                    <th className="px-4 py-3">Total hours</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Remarks</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((intern, index) => (
                    <tr
                      key={intern.attendance_id || startIndex + index}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{startIndex + index + 1}</td>
                      <td className="px-4 py-3 font-bold">{intern.intern_name}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-normal">
                          {intern.abbreviation}
                        </span>
                      </td>
                      <td className="px-4 py-3">{formatDate(intern.attendance_date)}</td>
                      <td className="px-4 py-3">{intern.time_in ? formatTime(intern.time_in) : ""}</td>
                      <td className="px-4 py-3">{intern.time_out ? formatTime(intern.time_out) : ""}</td>
                      <td className="px-4 py-3">{intern.total_hours ? formatDuration(intern.total_hours) : "00:00:00"}</td>
                      <td className="px-4 py-3">{intern.check_in}</td>
                      <td className="px-4 py-3">{intern.remarks}</td>
                      <td className="px-4 py-3 relative">
                        <button
                          className="action-button flex items-center text-sm text-gray-600 hover:text-cyan-600"
                          onClick={(e) => handleActionButtonClick(e, index)}
                        >
                          <Ellipsis className="w-8 h-8" strokeWidth={1} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        
        {!loading && filteredData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            startIndex={startIndex}
            endIndex={Math.min(startIndex + itemsPerPage, filteredData.length)}
            totalEntries={filteredData.length}
            itemsPerPage={itemsPerPage}
          />
        )}
        
        {/* Dropdown menu rendered outside the table */}
        {actionMenuIndex !== null && (
          <div
            ref={dropdownRef}
            className="bg-white border shadow-lg rounded-lg w-40 z-50 fixed"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
            }}
          >
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => {
                const intern = paginatedData[actionMenuIndex];
                handleEdit(intern);
                setActionMenuIndex(null);
              }}
            >
              Edit
            </button>
           
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
              onClick={() => {
                const intern = paginatedData[actionMenuIndex];
                setSelectedIntern(intern);
                setShowDeleteModal(true);
                setActionMenuIndex(null);
              }}
            >
              Delete
            </button>
          </div>
        )}
        
        {/* Edit Modal */}
        {showEditModal && selectedIntern && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md">
              <h2 className="text-lg font-semibold mb-4 text-center">
                Edit Remarks for <br />
                <span className="font-bold">{selectedIntern.intern_name}</span>
              </h2>
              <div className="mb-4">
                <textarea
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  placeholder="Enter remarks..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows={4}
                />
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setEditModal(false);
                    setEditRemarks("");
                  }}
                  className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditChanges}
                  className="px-4 py-2 rounded-md text-white bg-teal-500 hover:bg-teal-600 transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Delete Modal */}
        {showDeleteModal && selectedIntern && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md">
              <h2 className="text-lg font-semibold mb-4 text-center">
                Are you sure you want to delete <br />
                <span className="font-bold">{selectedIntern.intern_name}</span>'s
                attendance record?
              </h2>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(selectedIntern!.intern_id)}
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
  );
};

export default TimeTable;