import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface FileViewerModalProps {
  fileUrl: string | null;
  onClose: () => void;
  title?: string;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({ fileUrl, onClose, title = "View Document" }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!fileUrl) return null;

  const API_BASE = import.meta.env.VITE_API_URL || '';
  const fullUrl = API_BASE + fileUrl;
  const isPdf = fileUrl.toLowerCase().endsWith('.pdf');

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '90%',
          maxWidth: '1200px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <X size={24} />
          </button>
        </div>
        <div style={{ padding: '16px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'center' }}>
          {isPdf ? (
            <iframe
              src={fullUrl}
              style={{ width: '100%', height: 'calc(100vh - 120px)', border: 'none' }}
              title={title}
            />
          ) : (
            <img
              src={fullUrl}
              style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 120px)', objectFit: 'contain' }}
              alt="Document"
            />
          )}
        </div>
      </div>
    </div>
  );
};
