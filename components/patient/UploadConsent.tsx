'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, ArrowLeft, FileText, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { summarizeConsent } from '@/lib/gemini';
import { extractTextFromPDF } from '@/lib/pdfExtractor';
import { toast } from '@/components/ui/Toast';
import ConsentViewer from './ConsentViewer';

interface UploadConsentProps {
  onBack: () => void;
}

export default function UploadConsent({ onBack }: UploadConsentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [consentData, setConsentData] = useState<any>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(uploadedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    try {
      // Extract text directly from PDF
      const extractedText = await extractTextFromPDF(file);
      
      if (!extractedText || extractedText.trim().length === 0) {
        toast('error', 'Could not extract text from PDF. Please ensure the PDF contains readable text.');
        setLoading(false);
        return;
      }
      
      // Summarize and analyze using Gemini
      const analysis = await summarizeConsent(extractedText);
      
      setConsentData({
        content: extractedText,
        ...analysis,
      });
    } catch (error) {
      console.error('Error analyzing consent:', error);
      toast('error', 'Failed to analyze consent form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (consentData) {
    return <ConsentViewer data={consentData} onBack={() => setConsentData(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Upload Consent Form</h1>
              <p className="text-gray-600">Upload a PDF consent form for AI analysis</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-lg text-primary-600">Drop the file here...</p>
            ) : (
              <>
                <p className="text-gray-700 mb-1">Drop your consent form here or click to browse</p>
                <p className="text-sm text-gray-500">PDF files only</p>
              </>
            )}
          </div>

          {file && (
            <div className="mt-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Document'
                  )}
                </Button>
              </div>

              {preview && !preview.includes('pdf') && (
                <div className="mt-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-96 mx-auto rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>
          )}
        </Card>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Upload your consent form (PDF or image)</li>
            <li>AI extracts and analyzes the content</li>
            <li>Get a simplified summary in plain language</li>
            <li>View risk assessment and key factors</li>
            <li>Ask questions in your preferred language</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
