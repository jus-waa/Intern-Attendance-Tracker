import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Download, ChevronDown } from 'lucide-react';

// Reusable Pagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxPagesToShow?: number;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxPagesToShow = 5,
  className = ""
}) => {
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      if (currentPage > 3) {
        pageNumbers.push("...");
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (currentPage < totalPages - 2) {
        pageNumbers.push("...");
      }

      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded border transition-colors ${
          currentPage === 1 
            ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
            : 'hover:bg-gray-200 text-gray-700 bg-white border-gray-300'
        }`}
      >
        &lt;
      </button>

      {getPageNumbers().map((page, index) =>
        typeof page === "number" ? (
          <button
            key={index}
            onClick={() => handlePageClick(page)}
            className={`px-3 py-1 rounded border transition-colors ${
              currentPage === page
                ? 'bg-[#25E2CC] text-white font-semibold border-[#25E2CC]'
                : 'hover:bg-gray-200 text-gray-700 bg-white border-gray-300'
            }`}
          >
            {page}
          </button>
        ) : (
          <span 
            key={index} 
            className="px-2 text-gray-500 select-none"
          >
            ...
          </span>
        )
      )}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded border transition-colors ${
          currentPage === totalPages 
            ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
            : 'hover:bg-gray-200 text-gray-700 bg-white border-gray-300'
        }`}
      >
        &gt;
      </button>
    </div>
  );
};

interface InternData {
  id: string;
  name: string;
  wdId: string;
  shiftSchedule: 'Morning Shift' | 'Mid Shift' | 'Graveyard Shift';
  coordinator: string;
  status: 'Complete' | 'Incomplete' | 'Ongoing';
  university: string;
  totalCompletedHours: number;
}

const InternHistoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('University');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const itemsPerPage = 10;
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sample data with university field and total completed hours - auto-generate IDs
  const baseInternData = [
    {
      name: 'Pukerat',
      wdId: '123456789',
      shiftSchedule: 'Morning Shift' as const,
      coordinator: 'Angelo Fuentes',
      status: 'Complete' as const,
      university: 'CSU',
      totalCompletedHours: 480
    },
    {
      name: 'JUAN DELA CRUZ',
      wdId: '123456789',
      shiftSchedule: 'Mid Shift' as const,
      coordinator: 'Angelo Fuentes',
      status: 'Complete' as const,
      university: 'CSU',
      totalCompletedHours: 520
    },
    {
      name: 'JUAN DELA CRUZ',
      wdId: '123456789',
      shiftSchedule: 'Graveyard Shift' as const,
      coordinator: 'Angelo Fuentes',
      status: 'Incomplete' as const,
      university: 'CSU',
      totalCompletedHours: 320
    },
    {
      name: 'JUAN DELA CRUZ',
      wdId: '123456789',
      shiftSchedule: 'Morning Shift' as const,
      coordinator: 'Angelo Fuentes',
      status: 'Complete' as const,
      university: 'CSU',
      totalCompletedHours: 500
    },
    {
      name: 'Maria Santos',
      wdId: '987654321',
      shiftSchedule: 'Mid Shift' as const,
      coordinator: 'Sarah Johnson',
      status: 'Ongoing' as const,
      university: 'UP',
      totalCompletedHours: 240
    },
    {
      name: 'Robert Chen',
      wdId: '456789123',
      shiftSchedule: 'Graveyard Shift' as const,
      coordinator: 'Mark Davis',
      status: 'Complete' as const,
      university: 'UST',
      totalCompletedHours: 450
    },
    {
      name: 'Ana Rodriguez',
      wdId: '789123456',
      shiftSchedule: 'Morning Shift' as const,
      coordinator: 'Lisa Thompson',
      status: 'Incomplete' as const,
      university: 'DLSU',
      totalCompletedHours: 180
    },
    {
      name: 'Michael Torres',
      wdId: '321654987',
      shiftSchedule: 'Mid Shift' as const,
      coordinator: 'Angelo Fuentes',
      status: 'Complete' as const,
      university: 'ADMU',
      totalCompletedHours: 510
    },
    {
      name: 'Jennifer Kim',
      wdId: '654987321',
      shiftSchedule: 'Graveyard Shift' as const,
      coordinator: 'Sarah Johnson',
      status: 'Ongoing' as const,
      university: 'FEU',
      totalCompletedHours: 360
    },
    {
      name: 'Carlos Mendoza',
      wdId: '147258369',
      shiftSchedule: 'Morning Shift' as const,
      coordinator: 'Mark Davis',
      status: 'Complete' as const,
      university: 'CSU',
      totalCompletedHours: 490
    },
    {
      name: 'Sophia Williams',
      wdId: '963852741',
      shiftSchedule: 'Mid Shift' as const,
      coordinator: 'Lisa Thompson',
      status: 'Incomplete' as const,
      university: 'UP',
      totalCompletedHours: 280
    },
    {
      name: 'David Park',
      wdId: '258147963',
      shiftSchedule: 'Graveyard Shift' as const,
      coordinator: 'Angelo Fuentes',
      status: 'Ongoing' as const,
      university: 'UST',
      totalCompletedHours: 340
    },
    {
      name: 'Isabella Garcia',
      wdId: '741963852',
      shiftSchedule: 'Morning Shift' as const,
      coordinator: 'Sarah Johnson',
      status: 'Complete' as const,
      university: 'DLSU',
      totalCompletedHours: 475
    },
    {
      name: 'James Wilson',
      wdId: '852369741',
      shiftSchedule: 'Mid Shift' as const,
      coordinator: 'Mark Davis',
      status: 'Complete' as const,
      university: 'ADMU',
      totalCompletedHours: 530
    }
  ];

  // Auto-generate IDs
  const internData: InternData[] = baseInternData.map((intern, index) => ({
    ...intern,
    id: (index + 1).toString()
  }));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter and search functionality with sorting
  const filteredData = useMemo(() => {
    let filtered = internData.filter(intern =>
      intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.wdId.includes(searchTerm) ||
      intern.coordinator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.university.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort the filtered data
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'Name':
          return a.name.localeCompare(b.name);
        case 'University':
          return a.university.localeCompare(b.university);
        case 'Date':
          return new Date().getTime() - new Date().getTime(); // Remove date sorting since no dates
        case 'Shift':
          return a.shiftSchedule.localeCompare(b.shiftSchedule);
        case 'Status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, sortBy]);

  // Pagination with display numbers
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Add display numbers for current page
  const paginatedDataWithDisplayNumbers = paginatedData.map((intern, index) => ({
    ...intern,
    displayNumber: startIndex + index + 1
  }));

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      if (currentPage > 3) {
        pageNumbers.push("...");
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (currentPage < totalPages - 2) {
        pageNumbers.push("...");
      }

      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  // Export functions
  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'University', 'Shift Schedule', 'Completed Hours', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => 
        [row.id, row.name, row.university, row.shiftSchedule, row.totalCompletedHours, row.status].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'intern_history.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setIsDropdownOpen(false);
  };

  const exportToPDF = () => {
    // Create a simple PDF-like content (HTML to be printed as PDF)
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Intern History Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>Intern History Report</h1>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>University</th>
                <th>Shift Schedule</th>
                <th>Completed Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map(row => `
                <tr>
                  <td>${row.id}</td>
                  <td>${row.name}</td>
                  <td>${row.university}</td>
                  <td>${row.shiftSchedule}</td>
                  <td>${row.totalCompletedHours}</td>
                  <td>${row.status}</td>
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
    // Create a simple Excel-compatible format (CSV with .xlsx extension)
    const headers = ['ID', 'Name', 'University', 'Shift Schedule', 'Completed Hours', 'Status'];
    const csvContent = [
      headers.join('\t'),
      ...filteredData.map(row => 
        [row.id, row.name, row.university, row.shiftSchedule, row.totalCompletedHours, row.status].join('\t')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'intern_history.xls');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setIsDropdownOpen(false);
  };

  const handleExportClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete':
        return 'bg-green-500';
      case 'Incomplete':
        return 'bg-red-500';
      case 'Ongoing':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderPaginationButtons = () => {
    return (
      <>
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
      </>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="flex flex-col">
        {/* Header */}
        <div className="bg-white px-6 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-gray-800 mb-2">Intern History</h1>
            <p className="text-sm text-gray-500">Track your list of previous interns</p>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 border border-gray-200 rounded-3xl focus:ring-2 focus:ring-teal-500 focus:border-transparent w-80 shadow-lg"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">SORT BY</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-200 rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 shadow-md"
                >
                  <option value="University">University</option>
                  <option value="Name">Name</option>
                  <option value="Shift">Shift</option>
                  <option value="Status">Status</option>
                </select>
              </div>
              
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleExportClick}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-2xl flex items-center space-x-2 transition-colors shadow-lg"
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

        {/* Table */}
        <div className="mx-6 my-4 rounded-3xl shadow-sm border border-gray-200 overflow-hidden bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift Schedule</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Hours</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDataWithDisplayNumbers.length > 0 ? (
                paginatedDataWithDisplayNumbers.map((intern, index) => (
                  <tr key={intern.id} className={`hover:bg-gray-50 ${index !== paginatedDataWithDisplayNumbers.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{intern.displayNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">{intern.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-left">
                      <span className="px-2 py-1 text-xs text-green-700 bg-green-100 rounded">{intern.university}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{intern.shiftSchedule}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{intern.totalCompletedHours} hrs</td>
                    <td className="px-6 py-4 whitespace-nowrap text-left">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getStatusColor(intern.status)}`}>
                        {intern.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <p className="text-lg font-medium">No entries found</p>
                      <p className="text-sm mt-1">There are no intern records on this page.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
          <div className="w-full flex justify-end mt-5 px-6 pb-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
      </div>
    </div>
  );
};

export default InternHistoryPage;