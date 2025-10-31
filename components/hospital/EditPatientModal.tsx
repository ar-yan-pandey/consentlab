'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';

interface EditPatientModalProps {
  patient: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditPatientModal({ patient, onClose, onSuccess }: EditPatientModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patient_name: patient.patient_name,
    age: patient.age.toString(),
    gender: patient.gender,
    disease: patient.disease,
    doctor_assigned: patient.doctor_assigned,
    treatment_course: patient.treatment_course,
    admission_date: patient.admission_date,
    expected_discharge_date: patient.expected_discharge_date || '',
    notes: patient.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const { error } = await supabase
        .from('patients')
        .update({
          patient_name: formData.patient_name,
          age: parseInt(formData.age),
          gender: formData.gender,
          disease: formData.disease,
          doctor_assigned: formData.doctor_assigned,
          treatment_course: formData.treatment_course,
          admission_date: formData.admission_date,
          expected_discharge_date: formData.expected_discharge_date || null,
          notes: formData.notes,
        })
        .eq('id', patient.id);

      if (error) throw error;

      toast('success', 'Patient updated successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error updating patient:', error);
      toast('error', 'Failed to update patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Modal isOpen onClose={onClose} title="Edit Patient" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Patient Name *"
            name="patient_name"
            value={formData.patient_name}
            onChange={handleChange}
            required
          />

          <Input
            label="Age *"
            name="age"
            type="number"
            min="0"
            max="150"
            value={formData.age}
            onChange={handleChange}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <Input
            label="Doctor Assigned *"
            name="doctor_assigned"
            value={formData.doctor_assigned}
            onChange={handleChange}
            required
          />

          <Input
            label="Admission Date *"
            name="admission_date"
            type="date"
            value={formData.admission_date}
            onChange={handleChange}
            required
          />

          <Input
            label="Expected Discharge Date"
            name="expected_discharge_date"
            type="date"
            value={formData.expected_discharge_date}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Disease / Condition *"
          name="disease"
          value={formData.disease}
          onChange={handleChange}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Treatment Course *
          </label>
          <textarea
            name="treatment_course"
            value={formData.treatment_course}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes / Attachments
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              'Update Patient'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
