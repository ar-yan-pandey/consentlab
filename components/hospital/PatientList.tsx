'use client';

import { useEffect, useState } from 'react';
import { Search, Eye, Edit, Trash2, QrCode, Copy, FileText, LogOut } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { supabase } from '@/lib/supabase';
import { useHospitalStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import QRCode from 'react-qr-code';
import { toast } from '@/components/ui/Toast';
import PatientDetailsModal from './PatientDetailsModal';
import EditPatientModal from './EditPatientModal';
import DischargePatientModal from './DischargePatientModal';

interface Patient {
  id: string;
  patient_id: string;
  patient_name: string;
  age: number;
  gender: string;
  disease: string;
  doctor_assigned: string;
  treatment_course: string;
  admission_date: string;
  discharge_status?: string;
}

interface PatientListProps {
  onRefresh?: () => void;
}

export default function PatientList({ onRefresh }: PatientListProps) {
  const user = useHospitalStore((state) => state.user);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<Patient | null>(null);
  const [showEdit, setShowEdit] = useState<Patient | null>(null);
  const [showDischarge, setShowDischarge] = useState<Patient | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPatients();
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredPatients(
        patients.filter(
          (p) =>
            p.patient_name.toLowerCase().includes(query) ||
            p.patient_id.toLowerCase().includes(query) ||
            p.disease.toLowerCase().includes(query) ||
            p.doctor_assigned.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, patients]);

  const loadPatients = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('hospital_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
      setFilteredPatients(data || []);

      // Fetch payment status for each patient
      if (data && data.length > 0) {
        const patientIds = data.map(p => p.patient_id);
        const { data: bills } = await supabase
          .from('discharge_bills')
          .select('patient_id, payment_status')
          .in('patient_id', patientIds);

        if (bills) {
          const statusMap: Record<string, string> = {};
          bills.forEach(bill => {
            statusMap[bill.patient_id] = bill.payment_status;
          });
          setPaymentStatus(statusMap);
        }
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (patientId: string) => {
    if (!confirm('Are you sure you want to delete this patient? This will also delete all associated consent forms.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);

      if (error) throw error;

      await loadPatients();
      onRefresh?.();
      toast('success', 'Patient deleted successfully');
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast('error', 'Failed to delete patient');
    }
  };

  const copyPatientId = (patientId: string) => {
    navigator.clipboard.writeText(patientId);
    toast('success', 'Patient ID copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-600">Loading patients...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, ID, disease, or doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No patients found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Patient ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Age/Gender
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Disease
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Doctor
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Admission
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {patient.patient_id}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {patient.patient_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {patient.age} / {patient.gender}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {patient.disease}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {patient.doctor_assigned}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(patient.admission_date)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {patient.discharge_status === 'discharged' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                          Discharged
                        </span>
                      )}
                      {patient.discharge_status === 'ready_for_discharge' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                          Ready for Discharge
                        </span>
                      )}
                      {paymentStatus[patient.patient_id] === 'paid' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                          ✓ Paid
                        </span>
                      )}
                      {paymentStatus[patient.patient_id] === 'pending' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                          Payment Pending
                        </span>
                      )}
                      {!patient.discharge_status && !paymentStatus[patient.patient_id] && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                          Admitted
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => copyPatientId(patient.patient_id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Copy ID"
                      >
                        <Copy className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => setShowQR(patient.patient_id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Show QR Code"
                      >
                        <QrCode className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => setShowDetails(patient)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => setShowEdit(patient)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => setShowDischarge(patient)}
                        className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Discharge Patient"
                      >
                        <LogOut className="w-4 h-4 text-emerald-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(patient.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && (
        <Modal isOpen={!!showQR} onClose={() => setShowQR(null)} title="Patient QR Code">
          <div className="text-center">
            <div className="bg-white p-8 inline-block rounded-lg">
              <QRCode value={showQR} size={256} />
            </div>
            <p className="mt-4 text-gray-600">
              Patient can scan this QR code to access their records
            </p>
            <code className="block mt-2 text-lg font-mono bg-gray-100 px-4 py-2 rounded">
              {showQR}
            </code>
          </div>
        </Modal>
      )}

      {/* Patient Details Modal */}
      {showDetails && (
        <PatientDetailsModal
          patient={showDetails}
          onClose={() => setShowDetails(null)}
          onRefresh={() => {
            loadPatients();
            onRefresh?.();
          }}
        />
      )}

      {/* Edit Patient Modal */}
      {showEdit && (
        <EditPatientModal
          patient={showEdit}
          onClose={() => setShowEdit(null)}
          onSuccess={() => {
            setShowEdit(null);
            loadPatients();
            onRefresh?.();
          }}
        />
      )}

      {/* Discharge Patient Modal */}
      {showDischarge && (
        <DischargePatientModal
          patient={showDischarge}
          onClose={() => setShowDischarge(null)}
          onSuccess={() => {
            setShowDischarge(null);
            loadPatients();
            onRefresh?.();
          }}
        />
      )}
    </>
  );
}
