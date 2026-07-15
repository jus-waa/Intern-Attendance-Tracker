import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxPagesToShow?: number;
  className?: string;
  // New props for showing entries info
  startIndex?: number;
  endIndex?: number;
  totalEntries?: number;
  itemsPerPage?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxPagesToShow = 5,
  className = "",
  startIndex,
  endIndex,
  totalEntries,
  itemsPerPage
}) => {
  // Calculate values if not provided
  const calculatedItemsPerPage = itemsPerPage || 5;
  const calculatedStartIndex = startIndex !== undefined ? startIndex : (currentPage - 1) * calculatedItemsPerPage;
  const calculatedEndIndex = endIndex !== undefined ? endIndex : calculatedStartIndex + calculatedItemsPerPage;
  const calculatedTotalEntries = totalEntries !== undefined ? totalEntries : totalPages * calculatedItemsPerPage;

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
    return null; // Don't show pagination if there's only one page or no pages
  }

  return (
    <div className={`mt-6 flex justify-between items-center ${className}`}>
      <div className="text-sm text-gray-600">
        Showing {calculatedStartIndex + 1} to {Math.min(calculatedEndIndex, calculatedTotalEntries)} of {calculatedTotalEntries} entries
      </div>
      
      <div className="flex items-center space-x-1 justify-end">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded border transition-colors ${
            currentPage === 1 
              ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
              : 'hover:bg-gray-200 text-gray-700 bg-white border-gray-300'
          }`}
          aria-label="Previous page"
        >
          &lt;
        </button>

        {/* Page Numbers */}
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
              aria-label={`Go to page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          ) : (
            <span 
              key={index} 
              className="px-2 text-gray-500 select-none"
              aria-hidden="true"
            >
              ...
            </span>
          )
        )}

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded border transition-colors ${
            currentPage === totalPages 
              ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
              : 'hover:bg-gray-200 text-gray-700 bg-white border-gray-300'
          }`}
          aria-label="Next page"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Pagination;