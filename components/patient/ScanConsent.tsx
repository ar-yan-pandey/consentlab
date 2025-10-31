'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, ArrowLeft, RotateCw, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { extractTextFromImage, summarizeConsent } from '@/lib/gemini';
import { toast } from '@/components/ui/Toast';
import ConsentViewer from './ConsentViewer';

interface ScanConsentProps {
  onBack: () => void;
}

export default function ScanConsent({ onBack }: ScanConsentProps) {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [consentData, setConsentData] = useState<any>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImgSrc(imageSrc);
    }
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
  };

  const handleAnalyze = async () => {
    if (!imgSrc) return;

    setLoading(true);
    try {
      const extractedText = await extractTextFromImage(imgSrc);
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
              <h1 className="text-2xl font-bold text-gray-900">Scan Consent Form</h1>
              <p className="text-gray-600">Use your camera to scan a physical document</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <div className="text-center">
            {!imgSrc ? (
              <>
                <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button onClick={capture} size="lg" className="flex items-center gap-2 mx-auto">
                  <Camera className="w-5 h-5" />
                  Capture Image
                </Button>
              </>
            ) : (
              <>
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <img
                    src={imgSrc}
                    alt="Captured consent form"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={retake}
                    className="flex items-center gap-2"
                  >
                    <RotateCw className="w-5 h-5" />
                    Retake
                  </Button>
                  <Button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    {loading ? 'Analyzing...' : 'Analyze Document'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>

        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-2">Tips for best results:</h3>
          <ul className="list-disc list-inside space-y-2 text-green-800">
            <li>Ensure good lighting on the document</li>
            <li>Hold the camera steady and parallel to the paper</li>
            <li>Make sure all text is visible and in focus</li>
            <li>Avoid shadows and glare on the document</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
