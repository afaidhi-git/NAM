
import React from 'react';
import QRCode from 'react-qr-code';
import { Asset } from '../types';
import { X, Printer, Copy } from 'lucide-react';

interface AssetQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
}

export const AssetQRModal: React.FC<AssetQRModalProps> = ({ isOpen, onClose, asset }) => {
  if (!isOpen || !asset) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('printable-qr-label');
    
    if (!printContent) {
      alert('Error: Label content not ready.');
      return;
    }

    // Use a new window for reliable printing across browsers
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    
    if (!printWindow) {
      alert('Please allow popups for this site to print labels.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Asset Label - ${asset.id}</title>
          <style>
            @page { 
              margin: 0; 
              size: auto; 
            }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #fff;
            }
            .label-container {
              border: 2px solid #000;
              border-radius: 8px;
              width: 320px;
              padding: 24px;
              text-align: center;
              box-sizing: border-box;
            }
            .qr-wrapper {
              margin-bottom: 16px;
              display: flex;
              justify-content: center;
            }
            /* Explicitly size the SVG to ensure it prints */
            svg {
              width: 160px !important;
              height: 160px !important;
              display: block;
            }
            h2 {
              font-size: 20px;
              margin: 0 0 8px 0;
              font-weight: 700;
              color: #000;
              line-height: 1.2;
            }
            .tag {
              display: inline-block;
              background: #f0f0f0;
              border: 1px solid #ccc;
              padding: 4px 12px;
              border-radius: 4px;
              font-family: 'Courier New', monospace;
              font-size: 16px;
              font-weight: 700;
              margin-bottom: 8px;
              color: #000;
            }
            .meta {
              font-size: 14px;
              color: #444;
            }
            @media print {
              body { margin: 0; -webkit-print-color-adjust: exact; }
              .label-container { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="label-container">
            ${printContent.innerHTML}
          </div>
          <script>
            // Wait for resources to load then print
            window.onload = function() {
              window.focus();
              setTimeout(function() {
                window.print();
                // Optional: close after print dialog is closed (works in some browsers)
                // window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(asset.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-semibold text-slate-800">Asset QR Code</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-8 flex flex-col items-center justify-center space-y-6 text-center">
          
          <div id="printable-qr-label">
            <div className="qr-wrapper mb-4 flex justify-center">
              <div className="p-2 bg-white rounded-lg">
                <QRCode 
                  value={asset.id} 
                  size={160}
                  level="H"
                />
              </div>
            </div>
            
            <div className="info-wrapper">
              <h2 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{asset.name}</h2>
              
              <div className="tag inline-flex items-center justify-center gap-2 text-slate-600 font-mono text-sm bg-slate-100 py-1 px-3 rounded-full mb-1">
                <span>{asset.id}</span>
              </div>
              
              <div className="meta text-sm text-slate-400 mt-1">
                SN: {asset.serialNumber}
              </div>
            </div>
          </div>

          <button 
            onClick={handleCopyId} 
            className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
          >
            <Copy size={12} /> Copy ID
          </button>

        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-slate-700 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all"
          >
            Close
          </button>
          <button 
            onClick={handlePrint}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-200 flex items-center justify-center gap-2 transition-all"
          >
            <Printer size={16} />
            Print Label
          </button>
        </div>
      </div>
    </div>
  );
};