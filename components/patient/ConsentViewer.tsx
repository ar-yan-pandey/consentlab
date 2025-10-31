'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  AlertCircle,
  MessageSquare,
  Send,
  Languages,
  FileSignature,
  Loader2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { getRiskColor, INDIAN_LANGUAGES } from '@/lib/utils';
import { translateText, answerConsentQuestion } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';
import DigiLockerSignature from './DigiLockerSignature';

interface ConsentViewerProps {
  data: {
    content: string;
    summary: string;
    riskLevel: 'low' | 'medium' | 'high';
    riskFactors: string[];
    patientInfo?: any;
    consentId?: string;
    isSigned?: boolean;
  };
  onBack: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ConsentViewer({ data, onBack }: ConsentViewerProps) {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translatedSummary, setTranslatedSummary] = useState(data.summary);
  const [translating, setTranslating] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTranslate = async (langCode: string) => {
    setSelectedLanguage(langCode);
    if (langCode === 'en') {
      setTranslatedSummary(data.summary);
      return;
    }

    setTranslating(true);
    try {
      const language = INDIAN_LANGUAGES.find((l) => l.code === langCode)?.name || 'English';
      const translated = await translateText(data.summary, language);
      setTranslatedSummary(translated);
    } catch (error) {
      console.error('Translation error:', error);
      toast('error', 'Failed to translate. Please try again.');
    } finally {
      setTranslating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const language = INDIAN_LANGUAGES.find((l) => l.code === selectedLanguage)?.name || 'English';
      const response = await answerConsentQuestion(userMessage, data.content, language);
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDigitalSignature = () => {
    if (!data.consentId) {
      toast('error', 'This consent form cannot be signed digitally at this time.');
      return;
    }
    setShowSignatureModal(true);
  };

  const handleSignatureSuccess = async (signature: string) => {
    try {
      const { error } = await supabase
        .from('consent_forms')
        .update({
          patient_signature: signature,
          signed_at: new Date().toISOString(),
        })
        .eq('id', data.consentId);

      if (error) throw error;
      
      setTimeout(() => {
        onBack();
      }, 500);
    } catch (error) {
      console.error('Signing error:', error);
      toast('error', 'Failed to save signature. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Consent Form Analysis</h1>
                <p className="text-gray-600">Simplified and translated for you</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowChat(!showChat)}
                className="flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                Ask Questions
              </Button>
              {data.consentId && !data.isSigned && (
                <Button
                  onClick={handleDigitalSignature}
                  className="flex items-center gap-2"
                >
                  <FileSignature className="w-5 h-5" />
                  Sign Digitally
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Language Selector */}
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <Languages className="w-6 h-6 text-primary-600" />
                <h2 className="text-lg font-bold text-gray-900">Select Language</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {INDIAN_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleTranslate(lang.code)}
                    disabled={translating}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedLanguage === lang.code
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {lang.name.split(' ')[0]}
                  </button>
                ))}
              </div>
              {translating && (
                <div className="mt-4 flex items-center gap-2 text-primary-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Translating...</span>
                </div>
              )}
            </Card>

            {/* Summary */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Simplified Summary</h2>
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {translatedSummary}
                </p>
              </div>
            </Card>

            {/* Full Content */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Full Consent Form</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {data.content}
                </p>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Risk Assessment */}
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-orange-600" />
                <h2 className="text-lg font-bold text-gray-900">Risk Assessment</h2>
              </div>
              <div className={`inline-block px-4 py-2 rounded-lg font-semibold text-lg ${getRiskColor(data.riskLevel)}`}>
                {data.riskLevel.toUpperCase()} RISK
              </div>
              <div className="mt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Key Risk Factors:</h3>
                <ul className="space-y-2">
                  {data.riskFactors.map((factor, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Patient Info */}
            {data.patientInfo && (
              <Card>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Patient Information</h2>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Name:</span>
                    <p className="text-gray-900">{data.patientInfo.patient_name}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">ID:</span>
                    <p className="text-gray-900 font-mono">{data.patientInfo.patient_id}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Doctor:</span>
                    <p className="text-gray-900">{data.patientInfo.doctor_assigned}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Chat Interface */}
        {showChat && (
          <div className="fixed bottom-0 right-0 w-full md:w-96 h-[500px] bg-white shadow-2xl rounded-t-2xl border-t-4 border-primary-600 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-gray-900">Ask Questions</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>Ask any questions about your consent form</p>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-2 rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your question..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                />
                <Button onClick={handleSendMessage} disabled={loading || !inputMessage.trim()}>
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* DigiLocker Signature Modal */}
      <DigiLockerSignature
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onSuccess={handleSignatureSuccess}
      />
    </div>
  );
}
