'use client';

import { useState } from 'react';
import { ArrowLeft, QrCode, Loader2, User, Calendar, FileText, LogOut, CreditCard } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';
import ConsentViewer from './ConsentViewer';
import DischargeView from './DischargeView';
import { formatDate } from '@/lib/utils';

interface ConnectHospitalProps {
  onBack: () => void;
}

export default function ConnectHospital({ onBack }: ConnectHospitalProps) {
  const [patientId, setPatientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);
  const [consentForms, setConsentForms] = useState<any[]>([]);
  const [selectedConsent, setSelectedConsent] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showDischarge, setShowDischarge] = useState(false);
  const [hasDischarge, setHasDischarge] = useState(false);

  const handleConnect = async () => {
    if (!patientId.trim()) {
      toast('error', 'Please enter a valid Patient ID');
      return;
    }

    setLoading(true);
    try {
      // Fetch patient data
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('patient_id', patientId.toUpperCase())
        .single();

      if (patientError || !patient) {
        toast('error', 'Patient ID not found. Please check and try again.');
        return;
      }

      // Fetch consent forms
      const { data: consents, error: consentError } = await supabase
        .from('consent_forms')
        .select('*')
        .eq('patient_id', patientId.toUpperCase());

      setPatientData(patient);
      setConsentForms(consents || []);

      // Check if patient has discharge summary
      const { data: discharge } = await supabase
        .from('discharge_summaries')
        .select('id')
        .eq('patient_id', patientId.toUpperCase())
        .limit(1);

      setHasDischarge(!!(discharge && discharge.length > 0));
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast('error', 'Failed to connect to hospital. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewConsent = (consent: any) => {
    setSelectedConsent({
      content: consent.content,
      summary: consent.summary,
      riskLevel: consent.risk_level,
      riskFactors: consent.risk_factors,
      patientInfo: patientData,
      consentId: consent.id,
      isSigned: !!consent.patient_signature,
    });
  };

  if (selectedConsent) {
    return (
      <ConsentViewer
        data={selectedConsent}
        onBack={() => setSelectedConsent(null)}
      />
    );
  }

  if (showDischarge && patientData) {
    return (
      <div className="min-h-screen bg-medical-gradient">
        <div className="fixed inset-0 bg-medical-pattern opacity-40 pointer-events-none" />
        <header className="relative bg-white/80 backdrop-blur-md shadow-medical border-b border-emerald-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setShowDischarge(false)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Discharge Summary</h1>
                <p className="text-gray-600">Review and complete payment</p>
              </div>
            </div>
          </div>
        </header>
        <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <DischargeView
            patientId={patientData.patient_id}
            patientName={patientData.patient_name}
          />
        </main>
      </div>
    );
  }

  if (patientData) {
    return (
      <div className="min-h-screen bg-medical-gradient">
        <div className="fixed inset-0 bg-medical-pattern opacity-40 pointer-events-none" />
        <header className="relative bg-white/80 backdrop-blur-md shadow-medical border-b border-emerald-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setPatientData(null)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Patient Profile</h1>
                <p className="text-gray-600">ID: {patientData.patient_id}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Discharge Alert */}
          {hasDischarge && (
            <div className="mb-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-8 text-white shadow-medical-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                    <LogOut className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Discharge Process Ready</h3>
                    <p className="text-emerald-50 text-lg">
                      Your discharge summary and billing information are available
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowDischarge(true)}
                  className="bg-white text-emerald-600 hover:bg-emerald-50 font-bold px-8 py-4 text-lg shadow-lg"
                >
                  <CreditCard className="w-6 h-6 mr-2" />
                  View & Pay
                </Button>
              </div>
            </div>
          )}

          {/* Patient Information */}
          <Card className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Patient Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="font-semibold text-gray-700">Name:</span>
                </div>
                <p className="text-gray-900 ml-7">{patientData.patient_name}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="font-semibold text-gray-700">Age / Gender:</span>
                </div>
                <p className="text-gray-900 ml-7">
                  {patientData.age} years / {patientData.gender}
                </p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Disease:</span>
                <p className="text-gray-900 mt-1">{patientData.disease}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Doctor Assigned:</span>
                <p className="text-gray-900 mt-1">{patientData.doctor_assigned}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Treatment Course:</span>
                <p className="text-gray-900 mt-1">{patientData.treatment_course}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Admission Date:</span>
                <p className="text-gray-900 mt-1">
                  {formatDate(patientData.admission_date)}
                </p>
              </div>
            </div>
            {patientData.notes && (
              <div className="mt-4 pt-4 border-t">
                <span className="font-semibold text-gray-700">Notes:</span>
                <p className="text-gray-900 mt-1">{patientData.notes}</p>
              </div>
            )}
          </Card>

          {/* Consent Forms */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Consent Forms</h2>
            {consentForms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No consent forms available yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {consentForms.map((consent) => (
                  <div
                    key={consent.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="w-8 h-8 text-primary-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {consent.form_type}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Created: {formatDate(consent.created_at)}
                        </p>
                        {consent.patient_signature && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                            Signed
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleViewConsent(consent)}
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-medical-gradient">
      <div className="fixed inset-0 bg-medical-pattern opacity-40 pointer-events-none" />
      <header className="relative bg-white/80 backdrop-blur-md shadow-medical border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Connect to Hospital</h1>
              <p className="text-gray-600">Enter your patient ID to access records</p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <QrCode className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Enter Patient ID
            </h2>
            <p className="text-gray-600">
              Your hospital provided you with a unique patient ID
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Patient ID"
              placeholder="CNLB-XXXXXXXX"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value.toUpperCase())}
              className="text-center text-lg font-mono"
            />

            <Button
              onClick={handleConnect}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect to Hospital'
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowScanner(true)}
              className="w-full flex items-center justify-center gap-2"
              size="lg"
            >
              <QrCode className="w-5 h-5" />
              Scan QR Code
            </Button>
          </div>
        </Card>

        <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="font-semibold text-purple-900 mb-2">What you'll get:</h3>
          <ul className="list-disc list-inside space-y-2 text-purple-800">
            <li>Complete patient profile and medical history</li>
            <li>All consent forms linked to your treatment</li>
            <li>Doctor information and treatment schedule</li>
            <li>Ability to review and sign consent forms digitally</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
