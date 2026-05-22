import { useRef, useState } from 'react';
import { CloudArrowUpIcon, DocumentCheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { uploadFile } from '../../../firebase/storage';

export const FileUpload = ({ label, onUpload, storagePath = 'uploads', accept = 'image/*,application/pdf', error }) => {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setUploading(true);
    setUploadError(null);
    setProgress(0);

    const ext = file.name.split('.').pop();
    const path = `${storagePath}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    try {
      const url = await uploadFile(file, path);
      onUpload(url);
      setProgress(100);
    } catch (err) {
      setUploadError('Error al subir el archivo. Intenta de nuevo.');
      setFileName(null);
      onUpload(null);
    } finally {
      setUploading(false);
    }
  };

  const clear = (e) => {
    e.stopPropagation();
    setFileName(null);
    setProgress(null);
    setUploadError(null);
    onUpload(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors
          ${uploading ? 'cursor-not-allowed opacity-70' : 'hover:border-blue-400 dark:hover:border-blue-500'}
          ${error ? 'border-red-400' : 'border-gray-300 dark:border-zinc-600'}
          bg-gray-50 dark:bg-zinc-800`}
      >
        {fileName && progress === 100 ? (
          <DocumentCheckIcon className="size-5 text-green-500 shrink-0" />
        ) : (
          <CloudArrowUpIcon className="size-5 text-gray-400 shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          {fileName ? (
            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{fileName}</p>
          ) : (
            <p className="text-sm text-gray-400">Haz clic para subir un archivo</p>
          )}
          {uploading && (
            <div className="mt-1.5 h-1 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full animate-pulse w-full" />
            </div>
          )}
          {progress === 100 && !uploading && (
            <p className="text-xs text-green-500 mt-0.5">Subido correctamente</p>
          )}
        </div>

        {fileName && !uploading && (
          <button type="button" onClick={clear}
            className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <XMarkIcon className="size-4" />
          </button>
        )}

        {uploading && (
          <div className="shrink-0 size-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {(uploadError || error) && (
        <p className="text-xs text-red-500">{uploadError ?? error?.message}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
};
