'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  FileText,
  Plus,
  LogOut,
  Search,
  Calendar,
  Activity,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useHospitalStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import PatientList from '@/components/hospital/PatientList';
import AddPatientModal from '@/components/hospital/AddPatientModal';

export default function HospitalDashboard() {
  const user = useHospitalStore((state) => state.user);
  const logout = useHospitalStore((state) => state.logout);
  const router = useRouter();
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [stats, setStats] = useState({
    totalPatients: 0,
    pendingConsents: 0,
    signedConsents: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push('/hospital');
      return;
    }

    loadStats();
  }, [user, router]);

  const loadStats = async () => {
    if (!user) return;

    try {
      // Get total patients
      const { count: patientCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('hospital_user_id', user.id);

      // Get consent stats
      const { data: consents } = await supabase
        .from('consent_forms')
        .select('patient_signature')
        .in(
          'patient_id',
          (
            await supabase
              .from('patients')
              .select('patient_id')
              .eq('hospital_user_id', user.id)
          ).data?.map((p) => p.patient_id) || []
        );

      const signed = consents?.filter((c) => c.patient_signature).length || 0;
      const pending = (consents?.length || 0) - signed;

      setStats({
        totalPatients: patientCount || 0,
        pendingConsents: pending,
        signedConsents: signed,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/hospital');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.hospitalName}
              </h1>
              <p className="text-sm text-gray-600">
                {user.fullName} • {user.role.replace('_', ' ').toUpperCase()}
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Consents</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingConsents}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Signed Consents</p>
                <p className="text-3xl font-bold text-gray-900">{stats.signedConsents}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Patient Management */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Patient Management</h2>
            <Button
              onClick={() => setShowAddPatient(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Patient
            </Button>
          </div>

          <PatientList onRefresh={loadStats} />
        </Card>
      </main>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <AddPatientModal
          onClose={() => setShowAddPatient(false)}
          onSuccess={() => {
            setShowAddPatient(false);
            loadStats();
          }}
        />
      )}
    </div>
  );
}
