//scan.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode, type Html5QrcodeResult } from "html5-qrcode";
import inputLogo from '../assets/input.png';

interface InternInfo {
  intern_id: string;
  name: string;
  school: string;
}

const Scan: React.FC = () => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedResult, setScannedResult] = useState<InternInfo | null>(null);
  const [error, setError] = useState<string>('');
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualUID, setManualUID] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const initScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          disableFlip: false
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          handleSuccessScan,
          handleScanError
        );

        setIsScanning(true);
        setError('');
      } catch (err) {
        console.error("Failed to start QR scanner:", err);
        setError(`Failed to start camera: ${err}`);

        try {
          const html5QrCode = new Html5Qrcode("reader");
          scannerRef.current = html5QrCode;

          const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          };

          await html5QrCode.start(
            { facingMode: "user" },
            config,
            handleSuccessScan,
            handleScanError
          );

          setIsScanning(true);
          setError('Camera started with front camera');
        } catch (frontCameraErr) {
          setError(`Camera access denied or not available: ${frontCameraErr}`);
        }
      }
    };

    const timer = setTimeout(initScanner, 1);

    return () => {
      clearTimeout(timer);
      stopScanning();
    };
  }, []);

  // Separate function to get intern info by ID
  const getInternInfo = async (internId: string): Promise<InternInfo | null> => {
    try {
      const response = await fetch("http://localhost:8000/intern/list");
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Intern list response:", data);
      
      // Find the intern by ID
      const intern = data.result?.find((intern: any) => intern.intern_id === internId);
      
      if (intern) {
        return {
          intern_id: internId,
          name: intern.intern_name || 'Unknown Intern',
          school: intern.school_name || 'Unknown School'
        };
      } else {
        console.warn(`Intern with ID ${internId} not found`);
        return null;
      }
    } catch (err) {
      console.error("Error fetching intern info:", err);
      return null;
    }
  };

  // Function to register attendance only
  const registerAttendance = async (internId: string): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:8000/attendance/qr-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intern_id: internId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Attendance response:", data);
      
      // Check if already checked out
      if (data.message === "Already checked out today") {
        setError("Already checked out today");
        return false;
      }
      return true;
    } catch (err) {
      console.error("Error registering attendance:", err);
      setError("Failed to register attendance");
      return false;
    }
  };

  const handleSuccessScan = async (decodedText: string, decodedResult: Html5QrcodeResult) => {
    // Stop scanner immediately to prevent multiple scans
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping scanner", err);
      }
    }

    console.log(`QR Code detected: ${decodedText}`, decodedResult);
    setError('');
    setIsProcessing(true);

    try {
      // First, get intern info
      const internInfo = await getInternInfo(decodedText);
      
      if (!internInfo) {
        setError("Intern not found in system");
        setIsProcessing(false);
        // Restart scan after delay
        setTimeout(() => {
          startScanning();
        }, 3000);
        return;
      }

      // Then, register attendance
      const attendanceSuccess = await registerAttendance(decodedText);
      
      if (attendanceSuccess) {
        // Show success toast with intern info
        setScannedResult(internInfo);
      }
      
    } catch (err) {
      console.error("Error processing scan:", err);
      setError("Failed to process QR code");
    } finally {
      setIsProcessing(false);
    }

    // Restart scan after a delay
    setTimeout(() => {
      setScannedResult(null);
      startScanning();
    }, 3000);
  };

  const handleScanError = (errorMessage: string) => {
    if (!errorMessage.includes("NotFoundException")) {
      console.error("QR Scan Error:", errorMessage);
    }
    // else: silently ignore
  };


  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        setIsScanning(false);
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
  };

  const startScanning = async () => {
    if (scannerRef.current && !isScanning) {
      try {
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        };

        await scannerRef.current.start(
          { facingMode: "environment" },
          config,
          handleSuccessScan,
          handleScanError
        );

        setIsScanning(true);
        setError('');
      } catch (err) {
        setError(`Failed to restart camera: ${err}`);
      }
    }
  };

  const handleManualSubmit = async () => {
    if (!manualUID.trim()) {
      setError("Please enter a valid UID");
      return;
    }

    setIsProcessing(true);
    
    try {
      // First, get intern info
      const internInfo = await getInternInfo(manualUID.trim());
      
      if (!internInfo) {
        setError("Intern not found in system");
        setIsProcessing(false);
        return;
      }

      // Then, register attendance
      const attendanceSuccess = await registerAttendance(manualUID.trim());
      
      if (attendanceSuccess) {
        // Show success toast
        setScannedResult(internInfo);
        
        // Clear the toast after 3 seconds
        setTimeout(() => {
          setScannedResult(null);
        }, 3000);
      }
      
    } catch (err) {
      console.error("Error processing manual entry:", err);
      setError("Failed to process manual entry");
    } finally {
      setIsProcessing(false);
    }
    
    setShowManualModal(false);
    setManualUID('');
    startScanning();
  };

  return (
    <div className="flex flex-col items-center mt-12 p-4">
      <div className="text-center mb-6">
        <p className="text-[#0D223D] text-2xl font-semibold mb-2">Scan Your QR Code</p>
        <p className="text-[#969696] text-xs font-[400]">Your attendance is automatically detected by the system</p>
      </div>

      {/* QR Reader Container */}
      <div className="relative mb-4" style={{ width: '400px', height: '300px' }}>
        <div id="reader" className="w-full h-full border rounded-md"></div>

        {/* Manual Entry Icon Button */}
        <button
          onClick={() => setShowManualModal(true)}
          className="absolute top-2 right-2 p-1 bg-[#25E2CC] rounded-full shadow hover:bg-[#1eb5a3]"
          title="Enter UID manually"
        >
          <img src={inputLogo} className="w-5 h-5" />
        </button>

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p>Processing...</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* QR Scanned Toast Notification */}
      {scannedResult && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-white border-l-4 border-[#25E2CC] shadow-xl rounded-lg p-4 w-80 animate-slide-in">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-[#25E2CC] rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="ml-3 text-[#25E2CC] font-semibold">Attendance Registered</span>
            </div>
            <div className="ml-3 text-left text-[#253850]">
              <p className="font-medium text-sm">Name: {scannedResult.name}</p>
              <p className="font-regular text-xs">{scannedResult.school}</p>
              <p className="break-words mt-1 text-xs text-gray-500">UID: {scannedResult.intern_id}</p>
            </div>
          </div>
        </div>
      )}

      {/* Manual UID Modal */}
      {showManualModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-lg font-bold text-center mb-4">Enter UID Manually</h2>
            <input
              type="text"
              placeholder="Enter UID"
              value={manualUID}
              onChange={(e) => setManualUID(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowManualModal(false);
                  setManualUID('');
                  startScanning();
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleManualSubmit}
                className="bg-[#25E2CC] text-white px-4 py-2 rounded hover:bg-[#1eb5a3] disabled:opacity-50"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register CTA */}
      <div className="flex items-center mt-6 px-8 w-full max-w-md">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-4 text-gray-500 text-sm">Don't have a QR code?</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      <div className="flex justify-center mt-4">
        <button
          onClick={() => navigate('/interns', { state: { openModal: true } })}
          className="bg-[#25E2CC] text-gray-50 px-8 py-3 rounded-lg font-bold hover:bg-[#1eb5a3] transition-colors duration-200"
        >
          Register Now
        </button>
      </div>
    </div>
  );
};

export default Scan;