'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Eye, Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import AddConsentModal from './AddConsentModal';

interface PatientDetailsModalProps {
  patient: any;
  onClose: () => void;
  onRefresh: () => void;
}

export default function PatientDetailsModal({
  patient,
  onClose,
  onRefresh,
}: PatientDetailsModalProps) {
  const [consentForms, setConsentForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddConsent, setShowAddConsent] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState<any>(null);

  useEffect(() => {
    loadConsentForms();
  }, [patient]);

  const loadConsentForms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('consent_forms')
        .select('*')
        .eq('patient_id', patient.patient_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConsentForms(data || []);
    } catch (error) {
      console.error('Error loading consent forms:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen onClose={onClose} title="Patient Details" size="xl">
        <div className="space-y-6">
          {/* Patient Information */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Patient Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-semibold text-gray-700">Patient ID:</span>
                <p className="text-gray-900 font-mono">{patient.patient_id}</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-700">Name:</span>
                <p className="text-gray-900">{patient.patient_name}</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-700">Age / Gender:</span>
                <p className="text-gray-900">
                  {patient.age} years / {patient.gender}
                </p>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-700">Doctor:</span>
                <p className="text-gray-900">{patient.doctor_assigned}</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-700">Disease:</span>
                <p className="text-gray-900">{patient.disease}</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-700">Admission Date:</span>
                <p className="text-gray-900">{formatDate(patient.admission_date)}</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-sm font-semibold text-gray-700">Treatment Course:</span>
                <p className="text-gray-900">{patient.treatment_course}</p>
              </div>
              {patient.notes && (
                <div className="md:col-span-2">
                  <span className="text-sm font-semibold text-gray-700">Notes:</span>
                  <p className="text-gray-900">{patient.notes}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Consent Forms */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Consent Forms</h3>
              <Button
                size="sm"
                onClick={() => setShowAddConsent(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Consent
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
              </div>
            ) : consentForms.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">No consent forms yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {consentForms.map((consent) => (
                  <div
                    key={consent.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900">{consent.form_type}</h4>
                      <p className="text-sm text-gray-600">
                        Created: {formatDate(consent.created_at)}
                      </p>
                      {consent.patient_signature && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                          Signed by Patient
                        </span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedConsent(consent)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Add Consent Modal */}
      {showAddConsent && (
        <AddConsentModal
          patient={patient}
          onClose={() => setShowAddConsent(false)}
          onSuccess={() => {
            setShowAddConsent(false);
            loadConsentForms();
            onRefresh();
          }}
        />
      )}

      {/* View Consent Modal */}
      {selectedConsent && (
        <Modal
          isOpen
          onClose={() => setSelectedConsent(null)}
          title="Consent Form Details"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <span className="text-sm font-semibold text-gray-700">Form Type:</span>
              <p className="text-gray-900">{selectedConsent.form_type}</p>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700">Risk Level:</span>
              <span
                className={`inline-block ml-2 px-3 py-1 rounded-lg font-semibold ${
                  selectedConsent.risk_level === 'high'
                    ? 'bg-red-100 text-red-700'
                    : selectedConsent.risk_level === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {selectedConsent.risk_level?.toUpperCase()}
              </span>
            </div>
            {selectedConsent.summary && (
              <div>
                <span className="text-sm font-semibold text-gray-700">Summary:</span>
                <p className="text-gray-900 mt-1">{selectedConsent.summary}</p>
              </div>
            )}
            <div>
              <span className="text-sm font-semibold text-gray-700">Full Content:</span>
              <div className="mt-1 p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
                <p className="text-gray-900 whitespace-pre-wrap">{selectedConsent.content}</p>
              </div>
            </div>
            {selectedConsent.risk_factors && selectedConsent.risk_factors.length > 0 && (
              <div>
                <span className="text-sm font-semibold text-gray-700">Risk Factors:</span>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  {selectedConsent.risk_factors.map((factor: string, index: number) => (
                    <li key={index} className="text-gray-900">
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Doctor Signature:</span>
                  <p className="text-gray-600 font-mono text-xs mt-1">
                    {selectedConsent.doctor_signature}
                  </p>
                </div>
                {selectedConsent.patient_signature && (
                  <div>
                    <span className="font-semibold text-gray-700">Patient Signature:</span>
                    <p className="text-gray-600 font-mono text-xs mt-1">
                      {selectedConsent.patient_signature}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Signed: {formatDate(selectedConsent.signed_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
