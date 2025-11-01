'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Upload, Scan, Link2, FileText, Shield, Languages, Activity, Heart, Stethoscope, ClipboardCheck } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import UploadConsent from '@/components/patient/UploadConsent';
import ScanConsent from '@/components/patient/ScanConsent';
import ConnectHospital from '@/components/patient/ConnectHospital';

export default function PatientHome() {
  const [activeView, setActiveView] = useState<'home' | 'upload' | 'scan' | 'connect'>('home');

  if (activeView === 'upload') {
    return <UploadConsent onBack={() => setActiveView('home')} />;
  }

  if (activeView === 'scan') {
    return <ScanConsent onBack={() => setActiveView('home')} />;
  }

  if (activeView === 'connect') {
    return <ConnectHospital onBack={() => setActiveView('home')} />;
  }

  return (
    <div className="min-h-screen bg-medical-gradient">
      {/* Medical Pattern Overlay */}
      <div className="fixed inset-0 bg-medical-pattern opacity-40 pointer-events-none" />
      
      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-md shadow-medical border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image 
                src="/logo.png" 
                alt="ConsentLab Logo" 
                width={48} 
                height={48}
                className="rounded-xl shadow-medical"
              />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">ConsentLab</h1>
                <p className="text-gray-600 text-sm font-medium">Understand. Trust. Consent.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Secure & Private</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-medical border border-emerald-100 mb-6">
            <Heart className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">Trusted by 10,000+ Patients</span>
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Medical Consent
            <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Made Simple & Clear
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Upload, scan, or connect to your hospital to understand your medical consent forms in your preferred language
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div 
            onClick={() => setActiveView('upload')}
            className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-2xl shadow-medical hover:shadow-medical-lg border border-emerald-100 p-8 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Upload Consent</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Upload a PDF of your consent form for instant AI-powered analysis
              </p>
              <div className="inline-flex items-center gap-2 text-emerald-600 font-semibold group-hover:gap-3 transition-all">
                <span>Get Started</span>
                <span>→</span>
              </div>
            </div>
          </div>

          <div 
            onClick={() => setActiveView('scan')}
            className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-2xl shadow-medical hover:shadow-medical-lg border border-teal-100 p-8 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Scan className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Scan Document</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Use your camera to scan a physical consent form instantly
              </p>
              <div className="inline-flex items-center gap-2 text-teal-600 font-semibold group-hover:gap-3 transition-all">
                <span>Open Camera</span>
                <span>→</span>
              </div>
            </div>
          </div>

          <div 
            onClick={() => setActiveView('connect')}
            className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-2xl shadow-medical hover:shadow-medical-lg border border-cyan-100 p-8 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Link2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Connect Hospital</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Enter your patient ID to access your hospital records
              </p>
              <div className="inline-flex items-center gap-2 text-cyan-600 font-semibold group-hover:gap-3 transition-all">
                <span>Connect Now</span>
                <span>→</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-medical-lg p-10 border border-emerald-100">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200 mb-4">
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">Powered by AI</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              What We Offer
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">AI-Powered Analysis</h4>
              <p className="text-gray-600 leading-relaxed">
                Automatic extraction and summarization of consent forms with intelligent insights
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center mb-4">
                <Languages className="w-8 h-8 text-teal-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">Multi-Language Support</h4>
              <p className="text-gray-600 leading-relaxed">
                Available in 12+ Indian languages for better understanding
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl flex items-center justify-center mb-4">
                <ClipboardCheck className="w-8 h-8 text-cyan-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">Risk Assessment</h4>
              <p className="text-gray-600 leading-relaxed">
                Clear indication of treatment risks and important factors
              </p>
            </div>
          </div>
        </div>

        {/* Hospital Login Link */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center gap-4 px-8 py-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-medical border border-emerald-100">
            <div className="flex items-center gap-2 text-gray-700">
              <Stethoscope className="w-5 h-5 text-emerald-600" />
              <span className="font-medium">Are you a healthcare provider?</span>
            </div>
            <a
              href="/hospital"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-medical hover:shadow-medical-lg transition-all duration-200"
            >
              <Shield className="w-5 h-5" />
              <span>Login to Hospital Portal</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative bg-white/80 backdrop-blur-md border-t border-emerald-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">ConsentLab</span>
            </div>
            <p className="text-gray-600 font-medium mb-2">&copy; 2025 ConsentLab. All rights reserved.</p>
            <p className="text-sm text-gray-500">Empowering patients through informed consent</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
