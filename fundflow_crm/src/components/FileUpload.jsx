import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './Button';
import { uploadDocument } from '../../services/api'; // Assuming you have this service

const FileUpload = ({ plaintiffId, onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = useCallback(acceptedFiles => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = files.map(file => uploadDocument(plaintiffId, file));
      const results = await Promise.all(uploadPromises);
      
      // Handle success
      onUploadSuccess(results);
      setFiles([]); // Clear files after successful upload
    } catch (err) {
      setError('File upload failed. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border-dashed border-2 border-gray-300 rounded-lg">
      <div {...getRootProps()} className={`cursor-pointer p-10 text-center ${isDragActive ? 'bg-gray-100' : ''}`}>
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p>Drop the files here ...</p> :
            <p>Drag 'n' drop some files here, or click to select files</p>
        }
      </div>
      <aside className="mt-4">
        <h4 className="font-bold">Selected files:</h4>
        <ul>
          {files.map(file => (
            <li key={file.path}>{file.path} - {file.size} bytes</li>
          ))}
        </ul>
      </aside>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <div className="mt-4">
        <Button onClick={handleUpload} disabled={uploading || files.length === 0}>
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;
