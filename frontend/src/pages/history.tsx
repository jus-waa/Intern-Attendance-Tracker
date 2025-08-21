//history.tsx
import React, { useState, useRef, useEffect } from "react";
import Pagination from "../components/pagination";
import ExportButton from "../components/exportbutton";
import { Trash2 } from "lucide-react"; // icon for delete
import SchoolDropdown from "../components/schools"; 

type InternData = {
  intern_id: string;
  intern_name: string;
  school_name: string;
  shift_name: string;
  remarks: string;  
  status: string;
  abbreviation: string;
  total_hours: string;
}

const InternHistoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [sortBy, setSortBy] = useState("University");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [internData, setInternData] = useState<InternData[]>([]);
  const [activeSchool, setActiveSchool] = useState<string>("All"); 
  const itemsPerPage = 10;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDeleteBySchool = async (abbreviation: string) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/history/school/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abbreviation }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(`Failed to delete records: ${errorData?.message || res.statusText}`);
      }

      const data = await res.json();
      console.log("Delete response:", data);

      // Update state
      setInternData((prev) =>
        prev.filter((intern) => intern.abbreviation.toLowerCase() !== abbreviation.toLowerCase())
      );

      if (activeSchool.toLowerCase() === abbreviation.toLowerCase()) {
        setActiveSchool("All");
      }

      setCurrentPage(1);
      alert(`All records from ${abbreviation} removed successfully.`);
    } catch (err) {
      console.error("Error deleting records:", err);
      alert(`Error deleting records: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);  
      setShowDeleteModal(false);
    }
  };

  // Fetch data from backend
  useEffect(() => {
    const fetchInternHistory = async () => {
      try {
        const res = await fetch("http://localhost:8000/history/list");
        const data = await res.json();

        if (data?.result) {
          const mapped: InternData[] = data.result.map((intern: any) => ({
            intern_id: intern.intern_id ?? "",
            intern_name: intern.intern_name ?? "",
            school_name: intern.school_name ?? "",
            shift_name: intern.shift_name ?? "",
            remarks: intern.remarks ?? "",
            status: intern.status ?? "",
            abbreviation: intern.abbreviation ?? "",
            total_hours: intern.total_hours?.toString() ?? "0"
          }));
          setInternData(mapped);
        }
      } catch (err) {
        console.error("Error fetching intern history:", err);
      }
    };

    fetchInternHistory();
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/history/transfer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(res => res.json())
      .then(data => {
        console.log("Auto transfer result:", data);
      })
      .catch(err => {
        console.error("Error during auto transfer:", err);
      });
  }, []);

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

  // Use attendanceData instead of data for filtering
  const filteredData = internData
    .filter((intern) => 
      activeSchool === "All" || intern.abbreviation.toLowerCase() === activeSchool.toLowerCase()
    )
    .filter(
      (intern) =>
        intern.intern_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intern.remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intern.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

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
    <div className="mt-12">
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
          <div className="flex flex-row-reverse items-center justify-between">
            <div className="flex items-center space-x-4">
              <SchoolDropdown
                data={internData} // pass the full internData
                activeSchool={activeSchool}
                onSchoolChange={setActiveSchool}
              />

              <div className="relative" ref={dropdownRef}>
                <ExportButton
                  data={filteredData.map((row, i) => ({ ...row, id: i + 1 }))}
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
                    row.intern_name,
                    row.abbreviation,
                    row.shift_name,
                    row.total_hours,
                    row.status
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Delete All by School */}
        <div className="flex justify-end mr-6 mb-2">
          {activeSchool !== "All" && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All from {activeSchool}
            </button>
          )}
        </div>
          
        {/* Table */}
        <div className="mx-6 my-4 rounded-3xl shadow-sm border border-gray-200 overflow-hidden bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm text-gray-600 tracking-wider">
                <th className="px-6 py-4">
                  ID
                </th>
                <th className="px-6 py-4">
                  Name
                </th>
                <th className="px-6 py-4">
                  University
                </th>
                <th className="px-6 py-4">
                  Shift Schedule
                </th>
                <th className="px-6 py-4">
                  Completed Hours
                </th>
                <th className="px-6 py-4">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((intern, index) => (
                  <tr
                    key={intern.intern_id}
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
                      {intern.intern_name}
                    </td>
                    <td className="flex px-6 py-4 whitespace-nowrap self-center">
                      <span className="ml-1.5 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                        {intern.abbreviation}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-left">
                      {intern.shift_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-left">
                      {intern.total_hours} hours
                    </td>
                    <td className="flex px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${getStatusColor(
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
                  <td colSpan={7} className="px-6 py-12 text-center">
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
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md">
              <h2 className="text-lg font-semibold mb-4 text-center">
                Are you sure you want to delete all interns from{" "}
                <span className="font-bold">{activeSchool}</span>?
              </h2>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={loading}
                  className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteBySchool(activeSchool)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-white transition ${
                    loading
                      ? "bg-red-300 cursor-not-allowed"
                      : "bg-red-500 hover:bg-[#7c1b1b]"
                  }`}
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
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