import React, { useState, useMemo } from 'react';
import ReactDOMServer from 'react-dom/server'; // Needed to render icons/components to string for print
import { Asset, AssetStatus, AssetType } from '../types';
import { STATUS_COLORS } from '../constants';
import { Search, Filter, Plus, Edit2, Trash2, QrCode, Printer, CheckSquare, Square, X } from 'lucide-react';
import QRCode from 'react-qr-code';
import { PrintPreviewModal } from './PrintPreviewModal';

interface AssetListProps {
  assets: Asset[];
  onDelete: (id: string) => void;
  onEdit: (asset: Asset) => void;
  onAdd: () => void;
  onShowQR: (asset: Asset) => void;
}

export const AssetList: React.FC<AssetListProps> = ({ assets, onDelete, onEdit, onAdd, onShowQR }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Print Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.assignedTo && asset.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = filterStatus === 'All' || asset.status === filterStatus;
      const matchesType = filterType === 'All' || asset.type === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [assets, searchTerm, filterStatus, filterType]);

  // Selection Logic
  const handleSelectAll = () => {
    if (selectedIds.size === filteredAssets.length && filteredAssets.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAssets.map(a => a.id)));
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handlePrintClick = () => {
    if (selectedIds.size === 0) {
      alert("Please select at least one asset to print.");
      return;
    }
    setIsPreviewOpen(true);
  };

  const executePrint = (orderedAssets: Asset[]) => {
    try {
      const printWindow = window.open('', '_blank', 'width=800,height=800');
      
      if (!printWindow) {
        alert("Popups blocked. Please allow popups for this site to print labels.");
        return;
      }

      // Generate HTML for labels dynamically
      // We use ReactDOMServer to render the QRCode component to a string
      const labelsHtml = orderedAssets.map(asset => { // Fix: Define labelsHtml and iterate over orderedAssets
        const qrSvg = ReactDOMServer.renderToStaticMarkup(
            <QRCode value={asset.id} size={80} level="M" />
          );

          return `
            <div class="label-card">
              <div class="qr-section">
                ${qrSvg}
              </div>
              <div class="info-section">
                <h2>${asset.name}</h2>
                <div><span class="tag">${asset.id}</span></div>
                <div class="meta">SN: ${asset.serialNumber}</div>
              </div>
            </div>
          `;
        }).join(''); // Fix: Call .join('') on the map result

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Bulk Asset Labels</title>
            <style>
              @page { 
                margin: 0.5cm; 
              }
              body {
                font-family: sans-serif;
                padding: 20px;
                background: white;
              }
              .print-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 15px;
              }
              .label-card {
                border: 2px solid #000;
                border-radius: 8px;
                padding: 12px;
                display: flex;
                align-items: center;
                gap: 12px;
                page-break-inside: avoid;
                break-inside: avoid;
                background: white;
                height: 110px;
                box-sizing: border-box;
              }
              .qr-section {
                width: 80px;
                height: 80px;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .qr-section svg {
                width: 80px !important;
                height: 80px !important;
                display: block;
              }
              .info-section {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                justify-content: center;
              }
              h2 {
                font-size: 14px;
                margin: 0 0 6px 0;
                font-weight: bold;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                color: #000;
              }
              .tag {
                font-family: monospace;
                font-size: 12px;
                font-weight: bold;
                background: #eee;
                padding: 2px 6px;
                margin-bottom: 4px;
                display: inline-block;
                border: 1px solid #ccc;
                color: #000;
              }
              .meta {
                font-size: 11px;
                color: #444;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              @media print {
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <div class="print-grid">
              ${labelsHtml}
            </div>
            <script>
               window.onload = function() {
                  window.focus();
                  setTimeout(function() {
                    window.print();
                  }, 500);
               }
            </script>
          </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      setIsPreviewOpen(false);

    } catch (error: any) {
      console.error("Bulk print error:", error);
      alert("An unexpected error occurred while preparing labels.");
    }
  };

  // Fix: Move isAllSelected and selectedAssetsList inside the component scope
  const isAllSelected = filteredAssets.length > 0 && selectedIds.size === filteredAssets.length;
  
  // Get currently selected asset objects
  const selectedAssetsList = assets.filter(a => selectedIds.has(a.id));

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Print Preview Modal */}
      <PrintPreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        selectedAssets={selectedAssetsList}
        onConfirmPrint={executePrint}
      />

      {/* Controls Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        
        {/* Selection / Search Area */}
        {selectedIds.size > 0 ? (
          <div className="flex items-center gap-4 w-full md:w-auto flex-1 bg-blue-50 text-blue-800 px-4 py-2 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-left-2 duration-200">
             <span className="font-semibold text-sm">{selectedIds.size} selected</span>
             <button 
                onClick={() => setSelectedIds(new Set())}
                className="text-xs hover:underline flex items-center gap-1 opacity-70 hover:opacity-100"
             >
                <X size={12} /> Clear
             </button>
             <div className="flex-1"></div>
             <button 
                onClick={handlePrintClick}
                className="flex items-center gap-2 bg-white border border-blue-200 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors"
             >
                <Printer size={16} />
                <span>Print Labels</span>
             </button>
          </div>
        ) : (
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, ID, serial or employee..."
              className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative">
             <select 
               className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
             >
               <option value="All">All Status</option>
               {Object.values(AssetStatus).map(s => <option key={s} value={s}>{s}</option>)}
             </select>
             <Filter size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
             <select 
               className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
               value={filterType}
               onChange={(e) => setFilterType(e.target.value)}
             >
               <option value="All">All Types</option>
               {Object.values(AssetType).map(t => <option key={t} value={t}>{t}</option>)}
             </select>
             <Filter size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
          </div>

          <button 
            onClick={onAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ml-auto flex-shrink-0"
          >
            <Plus size={16} />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-10">
                   <button 
                      onClick={handleSelectAll}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                   >
                     {isAllSelected ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} />}
                   </button>
                </th>
                <th className="px-6 py-4">Asset Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Asset Tag / Serial</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => {
                  const isSelected = selectedIds.has(asset.id);
                  return (
                    <tr key={asset.id} className={`group transition-colors ${isSelected ? 'bg-blue-50/30' : 'hover:bg-slate-50/80'}`}>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleSelectRow(asset.id)}
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {isSelected ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} />}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{asset.name}</div>
                        <div className="text-xs text-slate-500">{asset.model}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{asset.type}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-mono font-semibold text-slate-700 text-xs">{asset.id}</span>
                          <span className="font-mono text-slate-400 text-[10px]">{asset.serialNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[asset.status]}`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {asset.assignedTo || <span className="text-slate-400 italic">Unassigned</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-600">RM {asset.price.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => onShowQR(asset)}
                            className="p-1.5 hover:bg-indigo-50 rounded-md text-slate-500 hover:text-indigo-600 transition-colors"
                            title="View QR Code"
                          >
                            <QrCode size={16} />
                          </button>
                          <button 
                            onClick={() => onEdit(asset)}
                            className="p-1.5 hover:bg-blue-50 rounded-md text-slate-500 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => onDelete(asset.id)}
                            className="p-1.5 hover:bg-red-50 rounded-md text-slate-500 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                       <Search size={32} className="opacity-20" />
                       <p>No assets found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
            <span>Showing {filteredAssets.length} of {assets.length} assets</span>
            <div className="flex gap-1">
                {/* Pagination placeholder */}
                <button className="px-2 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
                <button className="px-2 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
            </div>
        </div>
      </div>
    </div>
  );
};