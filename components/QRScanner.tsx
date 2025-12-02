
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Zap, ZapOff, ArrowRight, Type, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ isOpen, onClose, onScan }) => {
  const [manualId, setManualId] = useState('');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [torchSupported, setTorchSupported] = useState<boolean>(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setManualId('');
      setScanError(null);
      setIsTorchOn(false);
      return;
    }

    const scannerId = "reader-stream";
    let isMounted = true;

    const initScanner = async () => {
      try {
        if (scannerRef.current) {
          try {
             if (scannerRef.current.isScanning) {
                await scannerRef.current.stop();
             }
             scannerRef.current.clear();
          } catch (e) { 
             console.warn("Cleanup error", e);
          }
        }

        await new Promise(r => setTimeout(r, 100));
        
        if (!document.getElementById(scannerId)) {
            return;
        }

        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        const config = { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            experimentalFeatures: {
                useBarCodeDetectorIfSupported: true
            }
        };

        const onScanSuccess = (decodedText: string) => {
             if (isMounted) {
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(50);
                }
                onScan(decodedText);
             }
        };

        const onScanFailure = (errorMessage: string) => {
            // Ignore frame scan errors
        };
        
        // Attempt to start camera with fallback logic
        try {
            // First try environment (rear) camera
            await html5QrCode.start(
              { facingMode: "environment" }, 
              config, 
              onScanSuccess,
              onScanFailure
            );
        } catch (envError) {
            console.warn("Environment camera not found, attempting fallback to user/default camera.", envError);
            try {
                // Fallback to user (front) or default camera
                await html5QrCode.start(
                  { facingMode: "user" }, 
                  config, 
                  onScanSuccess,
                  onScanFailure
                );
            } catch (userError) {
                // Both failed, throw to outer catch
                throw userError;
            }
        }
        
        if (isMounted) {
            setHasCamera(true);
            setScanError(null);
        }

        // Check for torch support after camera starts
        setTimeout(() => {
           if (isMounted && html5QrCode) {
               try {
                   const track = html5QrCode.getRunningTrackCamera();
                   const capabilities = track?.getCapabilities();
                   // @ts-ignore - torch is not in standard types yet
                   if (capabilities && capabilities.torch) {
                       setTorchSupported(true);
                   }
               } catch (e) {
                   console.warn("Could not check torch capabilities", e);
               }
           }
        }, 500);

      } catch (err) {
        console.error("Error starting scanner", err);
        if (isMounted) {
            setHasCamera(false);
            setScanError("Camera access denied or device not found. Please check permissions.");
        }
      }
    };

    initScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
            scannerRef.current.stop()
                .then(() => scannerRef.current?.clear())
                .catch(err => console.error("Stop failed", err));
        } else {
            scannerRef.current.clear();
        }
      }
    };
  }, [isOpen, onScan]);

  const toggleTorch = async () => {
     if (scannerRef.current && hasCamera && torchSupported) {
         try {
             await scannerRef.current.applyVideoConstraints({
                 // @ts-ignore
                 advanced: [{ torch: !isTorchOn }]
             });
             setIsTorchOn(!isTorchOn);
         } catch (err) {
             console.error("Torch toggle failed.", err);
             // If it fails, disable the button to prevent further errors
             setTorchSupported(false);
         }
     }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) {
      onScan(manualId.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] relative">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center z-20 shadow-md">
          <h3 className="font-semibold flex items-center gap-2 text-lg">
            <Camera size={20} className="text-blue-400" />
            Scan Asset
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
            aria-label="Close Scanner"
          >
            <X size={24} />
          </button>
        </div>

        {/* Camera Area */}
        <div className="relative bg-black flex-1 min-h-[350px] flex flex-col justify-center overflow-hidden">
           <div id="reader-stream" className="w-full h-full object-cover"></div>

           {/* Custom Overlay / Viewfinder */}
           {hasCamera && (
             <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
               <div className="relative w-64 h-64">
                  <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-blue-500 rounded-tl-lg z-20"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-blue-500 rounded-tr-lg z-20"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-blue-500 rounded-bl-lg z-20"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-blue-500 rounded-br-lg z-20"></div>
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)] animate-[scan_2s_ease-in-out_infinite] z-20 opacity-80"></div>
               </div>
               <div className="absolute inset-0 border-[100vmax] border-black/60 box-content" style={{clipPath: 'inset(0 0 0 0)'}}></div>
             </div>
           )}

           {!hasCamera && (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center z-10 bg-slate-900">
                   <AlertCircle size={48} className="text-red-500 mb-4" />
                   <p className="mb-2 font-semibold text-white text-lg">Camera Unavailable</p>
                   <p className="text-sm leading-relaxed max-w-xs">{scanError || "Please ensure you have granted camera permissions."}</p>
               </div>
           )}

           {/* Flash Toggle Button */}
           {hasCamera && torchSupported && (
             <button 
                onClick={toggleTorch}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all z-30 shadow-lg ${
                    isTorchOn 
                      ? 'bg-yellow-400 text-yellow-900 ring-2 ring-yellow-200' 
                      : 'bg-black/40 text-white hover:bg-black/60 border border-white/20'
                }`}
                title="Toggle Flash"
             >
                {isTorchOn ? <ZapOff size={20} /> : <Zap size={20} />}
             </button>
           )}
        </div>

        {/* Manual Input Section */}
        <div className="p-5 bg-white border-t border-slate-200 z-20">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <Type size={14} />
                <span>Manual Entry</span>
            </div>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <input 
                      type="text" 
                      value={manualId}
                      onChange={(e) => setManualId(e.target.value.toUpperCase())}
                      placeholder="AST-XXXXXX"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-4 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono uppercase text-lg"
                      autoFocus={!hasCamera}
                  />
                </div>
                <button 
                    type="submit"
                    disabled={!manualId.trim()}
                    className="bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-5 rounded-xl font-medium hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-blue-200"
                >
                    <ArrowRight size={24} />
                </button>
            </form>
            <p className="text-center text-xs text-slate-400 mt-3">
              Enter Asset ID or Serial Number manually if scanning fails.
            </p>
        </div>

      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
