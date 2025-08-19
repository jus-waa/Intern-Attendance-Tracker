import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode, type Html5QrcodeResult } from "html5-qrcode";
import inputLogo from '../assets/input.png';

const Scan: React.FC = () => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedResult, setScannedResult] = useState<string>('');
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
  // registers attendance
  const registerAttendance = async (internId: string) => {
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
      console.log("Attendance registered:", data);
      console.log(response)
      return data;
    } catch (err) {
      console.error("Error registering attendance:", err);
      setError("Failed to register attendance");
      return null;
    }
  };

  const handleSuccessScan = async (decodedText: string, decodedResult: Html5QrcodeResult) => {
    // Stop scanner immediately so it won't loop detections
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

    try {
      const response = await fetch("http://localhost:8000/attendance/qr-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intern_id: decodedText })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Attendance registered:", data);

      if (data.message !== "Already checked out today") {
        setScannedResult(decodedText);
      }
    } catch (err) {
      console.error("Error registering attendance:", err);
      setError("Failed to register attendance");
    }

    // Restart scan after a delay
    setTimeout(() => {
      setScannedResult('');
      startScanning();
    }, 3000);
  };


  const handleScanError = (errorMessage: string) => {
    console.warn("QR Scan Error (ignored):", errorMessage);
    // No longer triggering modal automatically
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

  return (
    <div className="flex flex-col items-center p-4 relative">
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
          <img src={ inputLogo } className="w-5 h-5" />
        </button>
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
              <span className="ml-3 text-[#25E2CC] font-semibold">QR Code Scanned</span>
            </div>
            <p className="text-sm text-gray-600 break-words">{scannedResult}</p>
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
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const now = new Date();
                  console.log("Manual Entry UID:", manualUID);
                  console.log("Date:", now.toLocaleDateString());
                  console.log("Time:", now.toLocaleTimeString());
                  await registerAttendance(manualUID)
                  setShowManualModal(false);
                  setManualUID('');
                  startScanning();
                }}
                className="bg-[#25E2CC] text-white px-4 py-2 rounded hover:bg-[#1eb5a3]"
              >
                Submit
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
