import React, { useState, useRef, useEffect } from 'react';
import { Ellipsis, Download, ChevronDown } from 'lucide-react';
import SearchComponent from '../components/search'; // Import your separate search component
import Pagination from '../components/pagination'; // Import the pagination component

const rawData = [
  {
    name: 'JUAN DELA CRUZ',
    date: 'Jul 29, 2025',
    timeIn: '08:00 AM',
    timeOut: '05:00 PM',
    originalTimeOut: '05:00 PM',
    totalHours: '240 hours',
    status: 'Regular Hours',
    remarks: 'N/A',
    isChecked: true,
  },
  {
    name: 'MARIA SANTOS',
    date: 'Jul 30, 2025',
    timeIn: '09:00 AM',
    timeOut: '06:00 PM',
    originalTimeOut: '06:00 PM',
    totalHours: '240 hours',
    status: 'Regular Hours',
    remarks: 'N/A',
    isChecked: false,
  },
  {
    name: 'PEDRO GARCIA',
    date: 'Jul 31, 2025',
    timeIn: '08:30 AM',
    timeOut: '05:30 PM',
    originalTimeOut: '05:30 PM',
    totalHours: '240 hours',
    status: 'Regular Hours',
    remarks: 'N/A',
    isChecked: true,
  },
  {
    name: 'ANA RODRIGUEZ',
    date: 'Aug 01, 2025',
    timeIn: '09:15 AM',
    timeOut: '06:15 PM',
    originalTimeOut: '06:15 PM',
    totalHours: '240 hours',
    status: 'Regular Hours',
    remarks: 'N/A',
    isChecked: false,
  },
  {
    name: 'JOSE MARTINEZ',
    date: 'Aug 02, 2025',
    timeIn: '08:45 AM',
    timeOut: '05:45 PM',
    originalTimeOut: '05:45 PM',
    totalHours: '240 hours',
    status: 'Regular Hours',
    remarks: 'N/A',
    isChecked: true,
  },
  {
    name: 'LUCIA FERNANDEZ',
    date: 'Aug 03, 2025',
    timeIn: '08:15 AM',
    timeOut: '05:15 PM',
    originalTimeOut: '05:15 PM',
    totalHours: '240 hours',
    status: 'Regular Hours',
    remarks: 'N/A',
    isChecked: false,
  },
  {
    name: 'MIGUEL TORRES',
    date: 'Aug 04, 2025',
    timeIn: '09:30 AM',
    timeOut: '06:30 PM',
    originalTimeOut: '06:30 PM',
    totalHours: '240 hours',
    status: 'Regular Hours',
    remarks: 'N/A',
    isChecked: true,
  },
  {
    name: 'SOFIA LOPEZ',
    date: 'Aug 05, 2025',
    timeIn: '08:20 AM',
    timeOut: '05:20 PM',
    originalTimeOut: '05:20 PM',
    totalHours: '240 hours',
    status: 'Regular Hours',
    remarks: 'N/A',
    isChecked: false,
  },
];

const TimeTable = () => {
  const [data, setData] = useState(() =>
    rawData.map((item, index) => ({
      ...item,
      id: index + 1,
    }))
  );
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Name');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [showEditModal, setEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [editRemarks, setEditRemarks] = useState('');

  const [actionMenuIndex, setActionMenuIndex] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !event.target.closest('.action-button')
      ) {
        setActionMenuIndex(null);
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const filteredAndSortedData = data
    .filter(intern => 
      intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.date.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch(sortBy) {
        case 'Name':
          return a.name.localeCompare(b.name);
        case 'Status':
          return a.status.localeCompare(b.status);
        case 'Date':
          return new Date(a.date) - new Date(b.date);
        default:
          return 0;
      }
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredAndSortedData.slice(startIndex, endIndex);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setActionMenuIndex(null); // Close any open action menus
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
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
              ${filteredAndSortedData.map((row, index) => `
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
              `).join('')}
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
    setIsDropdownOpen(false);
  };

  const exportToExcel = () => {
    const headers = ['ID', 'Name', 'University', 'Date', 'Time In', 'Time Out', 'Total Hours', 'Status', 'Remarks'];
    const csvContent = [
      headers.join('\t'),
      ...filteredAndSortedData.map((row, index) => 
        [index + 1, row.name, 'CVSU', row.date, row.timeIn, row.timeOut, row.totalHours, row.status, row.remarks].join('\t')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'attendance_report.xls');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setIsDropdownOpen(false);
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
    setData(prevData => 
      prevData.map(item => 
        item === selectedIntern 
          ? { ...item, remarks: editRemarks }
          : item
      )
    );
    setEditModal(false);
    setSelectedIntern(null);
    setEditRemarks('');
  };

  const confirmDelete = () => {
    setData((prev) => prev.filter((item) => item !== selectedIntern));
    setShowDeleteModal(false);
    setSelectedIntern(null);
    
    // Adjust current page if needed after deletion
    const newTotalPages = Math.ceil((filteredAndSortedData.length - 1) / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  };

  return (
        <div className="flex flex-col min-h-screen px-4 relative">

      <div className="text-center mb-6">
        <p className="text-[#0D223D] text-4xl font-semibold mb-1">Attendance</p>
        <p className="text-[#969696] text-sm font-[400]">Manage your interns' attendance. Ilagay ang kamay sa gilid ng mata! Martsa!</p>
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
              <span className="text-sm text-gray-600">SORT BY</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 shadow-md"
              >
                <option value="Name">Name</option>
                <option value="Status">Status</option>
                <option value="Date">Date</option>
              </select>
            </div>
            
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleExportClick}
               className="bg-[#25E2CC] text-white px-6 py-2 rounded-xl font-semibold hover:bg-[#1eb5a3] flex items-center gap-2"
              >
                <Download size={16} />
                <span>Export</span>
                <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-2xl shadow-lg z-10 overflow-hidden">
                  <button
                    onClick={exportToPDF}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    PDF
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Excel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg w-full overflow-x-auto shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-gray-200">
        <table className="min-w-full text-sm text-left text-gray-700 table-auto">
          <thead className="bg-white text-gray-600 border-b">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
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
              <tr key={startIndex + index} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{startIndex + index + 1}</td>
                <td className="px-4 py-3 font-bold">{intern.name}</td>
                <td className="px-4 py-3 text-center">
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-normal">
                    CVSU
                  </span>
                </td>
                <td className="px-4 py-3">{intern.date}</td>
                <td className="px-4 py-3">{intern.timeIn}</td>
                <td className="px-4 py-3">{intern.timeOut}</td>
                <td className="px-4 py-3">{intern.totalHours}</td>
                <td className="px-4 py-3">{intern.status}</td>
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
        totalEntries={filteredAndSortedData.length}
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
              console.log('Delete intern:', paginatedData[actionMenuIndex].name);
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
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
                  setEditRemarks('');
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
              <span className="font-bold">{selectedIntern.name}</span>'s profile?
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
  );
};

export default TimeTable;