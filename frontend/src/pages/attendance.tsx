  import React, { useState, useRef, useEffect } from "react";
  import { Ellipsis, ChevronDown, Calendar } from "lucide-react";
  import SearchComponent from "../components/search"; // Import your separate search component
  import Pagination from "../components/pagination"; // Import the pagination component
  import ExportButton from "../components/exportbutton"; // Import the ExportButton component
  import CalendarComponent from "../components/calendar"; // Import the new calendar component
  import axios from "axios";

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

  const rawData = [
    {
      name: "JUAN DELA CRUZ",
      date: "Jul 29, 2025",
      timeIn: "08:00 AM",
      timeOut: "05:00 PM",
      originalTimeOut: "05:00 PM",
      totalHours: "240 hours",
      status: "Regular Hours",
      remarks: "N/A",
      isChecked: true,
    },
  ];

  const TimeTable = () => {
    const [data, setData] = useState(() =>
      rawData.map((item, index) => ({
        ...item,
        id: index + 1,
      }))
    );
    const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDate, setSelectedDate] = useState(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const [showEditModal, setEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedIntern, setSelectedIntern] = useState(null);
    const [editRemarks, setEditRemarks] = useState("");

    const [actionMenuIndex, setActionMenuIndex] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

    const dropdownRef = useRef(null);
    const calendarRef = useRef(null);
    // 
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target) &&
          !event.target.closest(".action-button")
        ) {
          setActionMenuIndex(null);
        }
        
        if (
          calendarRef.current &&
          !calendarRef.current.contains(event.target) &&
          !event.target.closest(".calendar-button")
        ) {
          setIsCalendarOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Function to parse date strings and compare them
    const parseDate = (dateStr) => {
      const [month, day, year] = dateStr.split(' ');
      const monthMap = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      return new Date(parseInt(year), monthMap[month], parseInt(day.replace(',', '')));
    };

    const isSameDay = (date1, date2) => {
      if (!date1 || !date2) return false;
      return date1.toDateString() === date2.toDateString();
    };

    const filteredData = data
      .filter(
        (intern) =>
          intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          intern.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          intern.date.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((intern) => {
        if (!selectedDate) return true;
        const internDate = parseDate(intern.date);
        return isSameDay(internDate, selectedDate);
      });

    // Pagination calculations
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Reset to first page when search term or selected date changes
    useEffect(() => {
      setCurrentPage(1);
    }, [searchTerm, selectedDate]);

    const handlePageChange = (page) => {
      setCurrentPage(page);
      setActionMenuIndex(null); // Close any open action menus
    };

    const formatSelectedDate = (date) => {
      if (!date) return '';
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });
    };

    const exportToPDF = () => {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Attendance Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              h1 { color: #333; }
            </style>
          </head>
          <body>
            <h1>Attendance Report</h1>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>University</th>
                  <th>Date</th>
                  <th>Time In</th>
                  <th>Time Out</th>
                  <th>Total Hours</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${filteredData
                  .map(
                    (row, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${row.name}</td>
                    <td>CVSU</td>
                    <td>${row.date}</td>
                    <td>${row.timeIn}</td>
                    <td>${row.timeOut}</td>
                    <td>${row.totalHours}</td>
                    <td>${row.status}</td>
                    <td>${row.remarks}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </body>
          </html>
        `;
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    };

    const exportToExcel = () => {
      const headers = [
        "ID",
        "Name",
        "University",
        "Date",
        "Time In",
        "Time Out",
        "Total Hours",
        "Status",
        "Remarks",
      ];
      const csvContent = [
        headers.join("\t"),
        ...filteredData.map((row, index) =>
          [
            index + 1,
            row.name,
            "CVSU",
            row.date,
            row.timeIn,
            row.timeOut,
            row.totalHours,
            row.status,
            row.remarks,
          ].join("\t")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "application/vnd.ms-excel" });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "attendance_report.xls");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

    const handleActionButtonClick = (event, index) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setActionMenuIndex(actionMenuIndex === index ? null : index);
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    };

    const handleEdit = (intern) => {
      setSelectedIntern(intern);
      setEditRemarks(intern.remarks);
      setEditModal(true);
    };

    const saveEditChanges = () => {
      setData((prevData) =>
        prevData.map((item) =>
          item === selectedIntern ? { ...item, remarks: editRemarks } : item
        )
      );
      setEditModal(false);
      setSelectedIntern(null);
      setEditRemarks("");
    };

    const confirmDelete = () => {
      setData((prev) => prev.filter((item) => item !== selectedIntern));
      setShowDeleteModal(false);
      setSelectedIntern(null);

      // Adjust current page if needed after deletion
      const newTotalPages = Math.ceil(
        (filteredData.length - 1) / itemsPerPage
      );
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    };

    // fetch data from db (attendance)
    useEffect(() => {
      const fetchAttendance = async () => {
        try {
          const response = await axios.get("http://localhost:8000/attendance/timesheet");
          setAttendanceData(response.data.result); // assuming `result` contains the list
          setLoading(false);
          console.log(response.data)
        } catch (error) {
          console.error("Failed to fetch attendance:", error);
          setLoading(false);
        }
      };

      fetchAttendance();
    }, []);
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
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">FILTER BY DATE</span>
                  <div className="relative" ref={calendarRef}>
                    <button
                      onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                      className="calendar-button border border-gray-200 rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 shadow-md flex items-center space-x-2 bg-white hover:bg-gray-50 transition-colors"
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
                </div>

                <div className="relative" ref={dropdownRef}>
                  <ExportButton
                    data={filteredData}
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
                    formatRowData={(row, index) => [
                      index + 1,
                      row.name,
                      "CVSU",
                      row.date,
                      row.timeIn,
                      row.timeOut,
                      row.totalHours,
                      row.status,
                      row.remarks,
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mx-6 my-4 rounded-3xl shadow-sm border border-gray-200 overflow-hidden bg-white">
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
                {attendanceData.map((intern, index) => (
                  <tr
                    key={startIndex + index}
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
                    <td className="px-4 py-3">{formatTime(intern.time_in)}</td>
                    <td className="px-4 py-3">{intern.time_out ? formatTime(intern.time_out) : ""}</td>
                    <td className="px-4 py-3">{intern.total_hours ? formatDuration(intern.total_hours) : ""}</td>
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
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            startIndex={startIndex}
            endIndex={startIndex + itemsPerPage}
            totalEntries={filteredData.length}
            itemsPerPage={itemsPerPage}
          />

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
                onClick={() => {
                  handleEdit(paginatedData[actionMenuIndex]);
                  setActionMenuIndex(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  console.log(
                    "Delete intern:",
                    paginatedData[actionMenuIndex].name
                  );
                  setSelectedIntern(paginatedData[actionMenuIndex]);
                  setShowDeleteModal(true);
                  setActionMenuIndex(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
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
                  <span className="font-bold">{selectedIntern.name}</span>
                </h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    value={editRemarks}
                    onChange={(e) => setEditRemarks(e.target.value)}
                    placeholder="Enter remarks..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows="4"
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
                  <span className="font-bold">{selectedIntern.name}</span>'s
                  profile?
                </h2>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
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