'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Upload, FileText } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useHospitalStore } from '@/lib/store';
import { generatePatientId, COMMON_DISEASES } from '@/lib/utils';
import { geminiModel } from '@/lib/gemini';
import { extractTextFromPDF } from '@/lib/pdfExtractor';
import { toast } from '@/components/ui/Toast';

interface AddPatientModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddPatientModal({ onClose, onSuccess }: AddPatientModalProps) {
  const user = useHospitalStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'manual' | 'report'>('manual');
  const [extracting, setExtracting] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [showOtherDisease, setShowOtherDisease] = useState(false);
  const [formData, setFormData] = useState({
    patient_name: '',
    age: '',
    gender: '',
    disease: '',
    doctor_assigned: '',
    treatment_course: '',
    admission_date: '',
    expected_discharge_date: '',
    notes: '',
  });

  useEffect(() => {
    loadDoctors();
  }, [user]);

  const loadDoctors = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('hospital_name', user.hospitalName)
        .order('name');
      
      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setExtracting(true);
    try {
      // Extract text directly from PDF
      const extractedText = await extractTextFromPDF(file);
      
      if (!extractedText || extractedText.trim().length === 0) {
        toast('error', 'Could not extract text from PDF. Please ensure the PDF contains readable text.');
        setExtracting(false);
        return;
      }
      
      // Use Gemini to parse patient details
      const prompt = `Extract patient information from this medical report and return ONLY a JSON object with these exact fields:
{
  "patient_name": "full name",
  "age": "age as number",
  "gender": "Male/Female/Other",
  "disease": "primary diagnosis",
  "treatment_course": "recommended treatment",
  "notes": "any additional relevant information"
}

Report text:
${extractedText}

Return ONLY the JSON, no other text.`;

      const result = await geminiModel.generateContent(prompt);
      const responseText = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setFormData(prev => ({
          ...prev,
          patient_name: parsed.patient_name || '',
          age: parsed.age?.toString() || '',
          gender: parsed.gender || '',
          disease: parsed.disease || '',
          treatment_course: parsed.treatment_course || '',
          notes: parsed.notes || '',
        }));
        toast('success', 'Patient details extracted successfully!');
      } else {
        toast('error', 'Could not parse patient details from report');
      }
    } catch (error) {
      console.error('Error extracting patient details:', error);
      toast('error', 'Failed to extract patient details');
    } finally {
      setExtracting(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: uploadMode === 'manual',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const patientId = generatePatientId();

      const { error } = await supabase.from('patients').insert({
        patient_id: patientId,
        patient_name: formData.patient_name,
        age: parseInt(formData.age),
        gender: formData.gender,
        disease: formData.disease,
        doctor_assigned: formData.doctor_assigned,
        treatment_course: formData.treatment_course,
        admission_date: formData.admission_date,
        expected_discharge_date: formData.expected_discharge_date || null,
        notes: formData.notes,
        hospital_user_id: user.id,
      });

      if (error) throw error;

      toast('success', `Patient added successfully! ID: ${patientId}`);
      onSuccess();
    } catch (error) {
      console.error('Error adding patient:', error);
      toast('error', 'Failed to add patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'disease') {
      setShowOtherDisease(value === 'Other');
      if (value !== 'Other') {
        setFormData(prev => ({ ...prev, disease: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Add New Patient" size="lg">
      {/* Mode Selection */}
      <div className="flex gap-2 mb-4">
        <Button
          type="button"
          variant={uploadMode === 'manual' ? 'primary' : 'outline'}
          onClick={() => setUploadMode('manual')}
          className="flex-1"
        >
          Manual Entry
        </Button>
        <Button
          type="button"
          variant={uploadMode === 'report' ? 'primary' : 'outline'}
          onClick={() => setUploadMode('report')}
          className="flex-1"
        >
          Upload Report
        </Button>
      </div>

      {/* Report Upload Section */}
      {uploadMode === 'report' && (
        <div className="mb-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            {extracting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                <p className="text-primary-600 font-medium">Extracting patient details...</p>
              </div>
            ) : (
              <>
                <p className="text-gray-700 mb-1">Drop patient report here or click to browse</p>
                <p className="text-sm text-gray-500">PDF files only</p>
              </>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI will automatically extract patient details from the report
          </p>
        </div>
      )}

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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Doctor Assigned *
            </label>
            <select
              name="doctor_assigned"
              value={formData.doctor_assigned}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.name}>
                  {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Disease / Condition *
          </label>
          <select
            name="disease"
            value={showOtherDisease ? 'Other' : formData.disease}
            onChange={handleChange}
            required={!showOtherDisease}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
          >
            <option value="">Select Disease/Condition</option>
            {COMMON_DISEASES.map((disease) => (
              <option key={disease} value={disease}>
                {disease}
              </option>
            ))}
          </select>
        </div>

        {showOtherDisease && (
          <Input
            label="Specify Disease / Condition *"
            name="disease"
            value={formData.disease}
            onChange={(e) => setFormData(prev => ({ ...prev, disease: e.target.value }))}
            placeholder="Enter disease or condition"
            required
          />
        )}

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
                Adding...
              </>
            ) : (
              'Add Patient'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
