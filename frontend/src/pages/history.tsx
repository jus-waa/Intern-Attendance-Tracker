import React, { useState, useMemo, useRef, useEffect } from "react";
import { Download, ChevronDown } from "lucide-react";
import Pagination from "../components/pagination";
import SearchComponent from "../components/search";
import ExportButton from "../components/exportbutton";
interface InternData {
  intern_id: string;
  name: string;
  wdId: string;
  shiftSchedule: "Morning Shift" | "Mid Shift" | "Graveyard Shift";
  coordinator: string;
  status: "Complete" | "Incomplete";
  university: string;
  totalCompletedHours: number;
}

const InternHistoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("University");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const itemsPerPage = 10;
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sample data with university field and total completed hours - auto-generate IDs
  const baseInternData = [
    {
      name: "Pukerat",
      wdId: "123456789",
      shiftSchedule: "Morning Shift" as const,
      coordinator: "Angelo Fuentes",
      status: "Complete" as const,
      university: "CvSU",
      totalCompletedHours: 480,
    },
  ];

  // Auto-generate IDs
  const internData: InternData[] = baseInternData.map((intern, index) => ({
    ...intern,
    id: (index + 1).toString(),
  }));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter and search functionality with sorting
  const filteredData = useMemo(() => {
    let filtered = internData.filter(
      (intern) =>
        intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intern.wdId.includes(searchTerm) ||
        intern.coordinator.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intern.university.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort the filtered data
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "Name":
          return a.name.localeCompare(b.name);
        case "University":
          return a.university.localeCompare(b.university);
        case "Date":
          return new Date().getTime() - new Date().getTime(); // Remove date sorting since no dates
        case "Shift":
          return a.shiftSchedule.localeCompare(b.shiftSchedule);
        case "Status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, sortBy, internData]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Export functions
  const exportToCSV = () => {
    const headers = [
      "ID",
      "Name",
      "University",
      "Shift Schedule",
      "Completed Hours",
      "Status",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredData.map((row) =>
        [
          row.id,
          row.name,
          row.university,
          row.shiftSchedule,
          row.totalCompletedHours,
          row.status,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "intern_history.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setIsDropdownOpen(false);
  };

  const exportToPDF = () => {
    // Create a simple PDF-like content (HTML to be printed as PDF)
    const printWindow = window.open("", "_blank");
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
              ${filteredData
                .map(
                  (row) => `
                <tr>
                  <td>${row.id}</td>
                  <td>${row.name}</td>
                  <td>${row.university}</td>
                  <td>${row.shiftSchedule}</td>
                  <td>${row.totalCompletedHours}</td>
                  <td>${row.status}</td>
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
    setIsDropdownOpen(false);
  };

  const exportToExcel = () => {
    // Create a simple Excel-compatible format (CSV with .xlsx extension)
    const headers = [
      "ID",
      "Name",
      "University",
      "Shift Schedule",
      "Completed Hours",
      "Status",
    ];
    const csvContent = [
      headers.join("\t"),
      ...filteredData.map((row) =>
        [
          row.id,
          row.name,
          row.university,
          row.shiftSchedule,
          row.totalCompletedHours,
          row.status,
        ].join("\t")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "intern_history.xls");
      link.style.visibility = "hidden";
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
      case "Complete":
        return "bg-green-500";
      case "Incomplete":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="flex flex-col">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-[#0D223D] text-4xl font-semibold mb-1">
            Intern History
          </p>
          <p className="text-[#969696] text-sm font-[400]">
            Track your previous interns’ information
          </p>
        </div>

        {/* Search and Controls */}
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
                  className="border  border-gray-200 rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 shadow-md"
                >
                  <option value="University">University</option>
                  <option value="Name">Name</option>
                  <option value="Shift">Shift</option>
                  <option value="Status">Status</option>
                </select>
              </div>

              <div className="relative" ref={dropdownRef}>
                <ExportButton
                  data={filteredData}
                  headers={[
                    "ID",
                    "Name",
                    "University", 
                    "Shift Schedule",
                    "Completed Hours",
                    "Status"
                  ]}
                  filename="intern_history"
                  title="Intern History Report"
                  formatRowData={(row) => [
                    row.id,
                    row.name,
                    row.university,
                    row.shiftSchedule,
                    row.totalCompletedHours,
                    row.status
                  ]}
                />

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
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  University
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shift Schedule
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed Hours
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((intern, index) => (
                  <tr
                    key={intern.id}
                    className={`hover:bg-gray-50 ${
                      index !== paginatedData.length - 1
                        ? "border-b border-gray-200"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-left">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">
                      {intern.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="ml-1.5 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                        {intern.university}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-left">
                      {intern.shiftSchedule}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-left">
                      {intern.totalCompletedHours} hrs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getStatusColor(
                          intern.status
                        )}`}
                      >
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
                      <p className="text-sm mt-1">
                        There are no intern records on this page.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mx-6 mb-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            startIndex={startIndex}
            endIndex={Math.min(endIndex, filteredData.length)}
            totalEntries={filteredData.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </div>
    </div>
  );
};

export default InternHistoryPage;
