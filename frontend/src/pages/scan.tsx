import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode, type Html5QrcodeResult } from "html5-qrcode";

const Scan: React.FC = () => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<string>('');
  const [error, setError] = useState<string>('');
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

  const handleSuccessScan = async (decodedText: string, decodedResult: Html5QrcodeResult) => {
    console.log(`QR Code detected: ${decodedText}`, decodedResult);
    setScannedResult(decodedText);
    setError('');

    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping scanner after successful scan", err);
      }
    }

    // Automatically hide notification after 3 seconds and resume scanning
    setTimeout(() => {
      setScannedResult('');
      startScanning();
    }, 3000);
  };

  const handleScanError = () => {
    // silent
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
    <div className="flex flex-col items-center min-h-screen p-4">
      <div className="text-center mb-6">
        <p className="text-[#0D223D] text-2xl font-semibold mb-2">Scan Your QR Code</p>
        <p className="text-[#969696] text-xs font-[400]">Your attendance is automatically detected by the system</p>
      </div>

      {!isScanning && !error && (
        <div className="w-full max-w-md bg-gray-100 border-2 border-[#E0E0E0] rounded-lg mb-4 flex items-center justify-center text-gray-500" style={{ width: '400px', height: '300px' }}>
          Initializing camera...
        </div>
      )}

      <div
        id="reader"
        className="mb-4"
        style={{ width: '400px', height: '300px' }}
      ></div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Notification Toast */}
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

      <div className="flex items-center mt-6 px-8 w-full max-w-md">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-4 text-gray-500 text-sm">Don't have a QR code?</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>   

      <div className="flex justify-center mt-4">
        <button onClick={() => navigate('/interns') } className="bg-[#25E2CC] text-gray-50 px-8 py-3 rounded-lg font-bold hover:bg-[#1eb5a3] transition-colors duration-200">
          Register Now
        </button>            
      </div>
    </div>
  );
};

export default Scan;
