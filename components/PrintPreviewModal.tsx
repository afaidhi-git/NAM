
import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import { Asset } from '../types';
import { X, Printer, GripVertical, Trash2, AlertCircle } from 'lucide-react';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAssets: Asset[];
  onConfirmPrint: (orderedAssets: Asset[]) => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedAssets, 
  onConfirmPrint 
}) => {
  const [printQueue, setPrintQueue] = useState<Asset[]>([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPrintQueue([...selectedAssets]);
    }
  }, [isOpen, selectedAssets]);

  const handleRemove = (id: string) => {
    setPrintQueue(prev => prev.filter(a => a.id !== id));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    // Required for Firefox
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    const newQueue = [...printQueue];
    const draggedItem = newQueue[draggedItemIndex];
    
    // Remove from old position
    newQueue.splice(draggedItemIndex, 1);
    // Insert at new position
    newQueue.splice(index, 0, draggedItem);
    
    setPrintQueue(newQueue);
    setDraggedItemIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Printer size={20} className="text-blue-600" />
              Print Preview
            </h3>
            <p className="text-sm text-slate-500">
              Drag to reorder labels. {printQueue.length} assets selected.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content Area - Scrollable Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50">
          {printQueue.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <AlertCircle size={48} className="mb-4 opacity-50" />
              <p>No assets selected for printing.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {printQueue.map((asset, index) => (
                <div 
                  key={asset.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`
                    bg-white border rounded-xl p-4 shadow-sm flex items-center gap-4 group relative select-none cursor-move transition-all
                    ${draggedItemIndex === index ? 'opacity-50 border-blue-400 border-dashed bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:shadow-md'}
                  `}
                >
                  <div className="text-slate-300 group-hover:text-slate-500 cursor-grab active:cursor-grabbing">
                    <GripVertical size={20} />
                  </div>
                  
                  <div className="w-16 h-16 bg-white p-1 rounded border border-slate-100 flex-shrink-0">
                    <QRCode value={asset.id} size={100} style={{ width: '100%', height: '100%' }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-800 truncate text-sm">{asset.name}</h4>
                    <span className="inline-block bg-slate-100 border border-slate-200 text-slate-600 text-xs font-mono px-1.5 py-0.5 rounded mt-1">
                      {asset.id}
                    </span>
                    <p className="text-xs text-slate-400 truncate mt-0.5">SN: {asset.serialNumber}</p>
                  </div>

                  <button 
                    onClick={() => handleRemove(asset.id)}
                    className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove from print job"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center flex-shrink-0">
          <div className="text-xs text-slate-400 hidden sm:block">
            Tip: Use standard Avery labels or cut along grid lines.
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => onConfirmPrint(printQueue)}
              disabled={printQueue.length === 0}
              className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-sm shadow-blue-200 flex items-center justify-center gap-2 transition-all"
            >
              <Printer size={18} />
              Print {printQueue.length} Labels
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
