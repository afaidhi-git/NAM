
import React, { useState, useEffect, useRef } from 'react';
import { DocumentTemplate } from '../types';
import { draftDocumentContent } from '../services/geminiService';
import { 
  FileText, Printer, Save, Sparkles, Bold, Italic, 
  AlignLeft, AlignCenter, AlignRight, List, Plus, Trash2, ArrowLeft, Upload, Image as ImageIcon
} from 'lucide-react';

interface PDFEditorProps {
  initialDocuments: DocumentTemplate[];
  onSave: (docs: DocumentTemplate[]) => void;
}

export const PDFEditor: React.FC<PDFEditorProps> = ({ initialDocuments, onSave }) => {
  const [documents, setDocuments] = useState<DocumentTemplate[]>(initialDocuments);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeDoc = documents.find(d => d.id === activeDocId);

  // Auto-save local edits to state
  const handleContentChange = () => {
    if (editorRef.current && activeDoc) {
      const newContent = editorRef.current.innerHTML;
      setDocuments(prev => prev.map(d => 
        d.id === activeDoc.id ? { ...d, content: newContent, lastModified: new Date().toISOString() } : d
      ));
    }
  };

  const handleCreateNew = () => {
    const newDoc: DocumentTemplate = {
      id: `DOC-${Date.now()}`,
      title: 'Untitled Document',
      category: 'Letter',
      lastModified: new Date().toISOString(),
      content: `<h1>New Document</h1><p>Start typing here...</p>`
    };
    setDocuments(prev => [newDoc, ...prev]);
    setActiveDocId(newDoc.id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this document?')) {
      setDocuments(prev => prev.filter(d => d.id !== id));
      if (activeDocId === id) setActiveDocId(null);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow || !activeDoc) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${activeDoc.title}</title>
          <style>
            body { 
              font-family: 'Times New Roman', Times, serif; 
              padding: 40px; 
              line-height: 1.6; 
              color: #000; 
              max-width: 800px;
              margin: 0 auto;
            }
            h1, h2, h3 { margin-bottom: 10px; line-height: 1.2; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            hr { border: 0; border-top: 1px solid #000; margin: 20px 0; }
            img { max-width: 100%; height: auto; }
            .pdf-wrapper { width: 100%; height: 800px; border: 1px solid #ccc; margin: 20px 0; }
            iframe, object { display: block; }
            @media print {
              body { padding: 0; }
              @page { margin: 2cm; }
              iframe, object { display: block; width: 100%; height: 100%; page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          ${activeDoc.content}
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleAiDraft = async () => {
    if (!activeDoc || !aiPrompt) return;
    setIsGenerating(true);
    const newContent = await draftDocumentContent(aiPrompt, activeDoc.content);
    if (newContent) {
      if (editorRef.current) {
         editorRef.current.innerHTML = newContent;
         handleContentChange();
      }
    }
    setIsGenerating(false);
    setAiPrompt('');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    // Callback to process the content after reading
    const processContent = (content: string, isText: boolean = false) => {
        if (activeDoc && editorRef.current) {
            // Edit Mode: Insert into existing doc
            editorRef.current.focus();
            if (isText) {
                 if (confirm('Importing will replace current content. Continue?')) {
                     editorRef.current.innerHTML = content;
                     handleContentChange();
                 }
            } else {
                 document.execCommand('insertHTML', false, content);
                 handleContentChange();
            }
        } else {
            // Dashboard Mode: Create new doc
            const newDoc: DocumentTemplate = {
                id: `DOC-${Date.now()}`,
                title: file.name,
                category: 'Imported',
                lastModified: new Date().toISOString(),
                content: content
            };
            setDocuments(prev => [newDoc, ...prev]);
            setActiveDocId(newDoc.id);
        }
    };

    if (file.type.startsWith('image/')) {
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const imgHtml = `<img src="${result}" style="max-width: 100%; margin: 10px 0; display: block;" />`;
        processContent(imgHtml);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      reader.onload = (event) => {
        const result = event.target?.result as string;
        // Use object tag for better compatibility and fallback support
        // Explicit dimensions and non-editable wrapper are crucial
        const pdfHtml = `
          <div contenteditable="false" style="width: 100%; height: 800px; margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f8fafc; overflow: hidden; position: relative;">
            <object data="${result}" type="application/pdf" width="100%" height="100%" style="display:block; width: 100%; height: 100%; min-height: 800px;">
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #64748b; padding: 20px; text-align: center;">
                    <p style="margin-bottom: 8px;">Unable to display PDF inline.</p>
                    <a href="${result}" download="${file.name}" style="color: #2563eb; text-decoration: underline; font-weight: 500;">Download ${file.name}</a>
                </div>
            </object>
          </div>
          <p><br/></p>
        `;
        processContent(pdfHtml);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'text/html' || file.type === 'text/plain') {
      reader.onload = (event) => {
         const result = event.target?.result as string;
         processContent(result, true);
      };
      reader.readAsText(file);
    } else {
      alert("Unsupported file type. Please upload an Image, PDF, HTML, or Text file.");
    }
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  useEffect(() => {
    onSave(documents);
  }, [documents, onSave]);

  if (activeDoc) {
    return (
      <div className="h-full flex flex-col bg-slate-50 animate-in fade-in duration-300">
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*,.html,.txt,.pdf" 
        />

        {/* Editor Toolbar */}
        <div className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveDocId(null)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              <ArrowLeft size={20} />
            </button>
            <input 
              className="text-lg font-bold text-slate-800 bg-transparent outline-none focus:bg-slate-50 px-2 rounded"
              value={activeDoc.title}
              onChange={(e) => setDocuments(prev => prev.map(d => d.id === activeDoc.id ? { ...d, title: e.target.value } : d))}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleUploadClick}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              title="Insert Image, PDF, or Import HTML"
            >
              <Upload size={16} /> Insert / Import
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Printer size={16} /> Export PDF
            </button>
          </div>
        </div>

        {/* Formatting Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex gap-1 items-center flex-wrap sticky top-0 z-10">
          <button onClick={() => execCmd('bold')} className="p-2 hover:bg-white rounded text-slate-700" title="Bold"><Bold size={16}/></button>
          <button onClick={() => execCmd('italic')} className="p-2 hover:bg-white rounded text-slate-700" title="Italic"><Italic size={16}/></button>
          <div className="w-px h-6 bg-slate-300 mx-1"></div>
          <button onClick={() => execCmd('justifyLeft')} className="p-2 hover:bg-white rounded text-slate-700" title="Align Left"><AlignLeft size={16}/></button>
          <button onClick={() => execCmd('justifyCenter')} className="p-2 hover:bg-white rounded text-slate-700" title="Align Center"><AlignCenter size={16}/></button>
          <button onClick={() => execCmd('justifyRight')} className="p-2 hover:bg-white rounded text-slate-700" title="Align Right"><AlignRight size={16}/></button>
          <div className="w-px h-6 bg-slate-300 mx-1"></div>
          <button onClick={() => execCmd('insertUnorderedList')} className="p-2 hover:bg-white rounded text-slate-700" title="Bullet List"><List size={16}/></button>
          <div className="flex-1"></div>
          
          {/* AI Helper */}
          <div className="flex items-center gap-2 bg-white rounded-lg border border-purple-200 pl-3 pr-1 py-1 w-full max-w-sm">
             <Sparkles size={14} className="text-purple-500" />
             <input 
               className="flex-1 text-sm outline-none placeholder:text-slate-400"
               placeholder="AI: 'Draft a formal letter to...'"
               value={aiPrompt}
               onChange={e => setAiPrompt(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleAiDraft()}
             />
             <button 
               onClick={handleAiDraft}
               disabled={!aiPrompt || isGenerating}
               className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded hover:bg-purple-100 transition-colors"
             >
               {isGenerating ? '...' : 'Draft'}
             </button>
          </div>
        </div>

        {/* Editor Canvas */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-200/50 flex justify-center">
           <div 
             className="bg-white shadow-lg w-full max-w-[800px] min-h-[1000px] p-[50px] outline-none"
             contentEditable
             ref={editorRef}
             onInput={handleContentChange}
             suppressContentEditableWarning={true}
             dangerouslySetInnerHTML={{ __html: activeDoc.content }}
             style={{ fontFamily: 'Times New Roman, serif' }}
           />
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*,.html,.txt,.pdf" 
      />

      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-xl font-bold text-slate-900">PDF Document Editor</h2>
            <p className="text-sm text-slate-500">Manage, edit, and export business documents</p>
         </div>
         <div className="flex gap-2">
             <button 
               onClick={handleCreateNew}
               className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
             >
               <FileText size={18} /> Create Blank
             </button>
             <button 
               onClick={handleUploadClick}
               className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
             >
               <Upload size={18} /> Upload File
             </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {documents.map(doc => (
          <div 
            key={doc.id}
            onClick={() => setActiveDocId(doc.id)}
            className="group bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col h-64"
          >
            <div className="flex-1 bg-slate-50 p-4 relative overflow-hidden">
               {/* Mini Preview */}
               <div className="bg-white shadow-sm w-full h-full p-2 text-[6px] text-slate-400 overflow-hidden pointer-events-none select-none opacity-60">
                  <div dangerouslySetInnerHTML={{ __html: doc.content }} />
               </div>
               
               <div className="absolute inset-0 bg-gradient-to-t from-slate-50/80 to-transparent"></div>
               <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => handleDelete(doc.id, e)}
                    className="p-2 bg-white text-red-500 rounded-full shadow-sm hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
               </div>
            </div>
            <div className="p-4 border-t border-slate-100">
               <h3 className="font-semibold text-slate-800 truncate">{doc.title}</h3>
               <div className="flex items-center gap-2 mt-1">
                 <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{doc.category}</span>
                 <span className="text-[10px] text-slate-400">
                   {new Date(doc.lastModified).toLocaleDateString()}
                 </span>
               </div>
            </div>
          </div>
        ))}
        
        {/* Upload / Create Card */}
        <button 
          onClick={handleUploadClick}
          className="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-xl flex flex-col items-center justify-center text-blue-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all h-64 group"
        >
           <div className="bg-white p-4 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
              <Upload size={32} />
           </div>
           <span className="text-sm font-semibold">Upload PDF / File</span>
           <span className="text-xs text-blue-400 mt-1">or create from template</span>
        </button>
      </div>
    </div>
  );
};
