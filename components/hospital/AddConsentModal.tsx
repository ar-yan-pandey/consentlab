'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { summarizeConsent } from '@/lib/gemini';
import { toast } from '@/components/ui/Toast';

interface AddConsentModalProps {
  patient: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddConsentModal({ patient, onClose, onSuccess }: AddConsentModalProps) {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [formData, setFormData] = useState({
    form_type: '',
    content: '',
    doctor_signature: '',
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('consent_templates')
        .select('*')
        .order('template_name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setFormData({
        form_type: template.template_name,
        content: template.content,
        doctor_signature: formData.doctor_signature,
      });
      setSelectedTemplate(templateId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      // Analyze consent with AI
      const analysis = await summarizeConsent(formData.content);

      const { error } = await supabase.from('consent_forms').insert({
        patient_id: patient.patient_id,
        form_type: formData.form_type,
        content: formData.content,
        summary: analysis.summary,
        risk_level: analysis.riskLevel,
        risk_factors: analysis.riskFactors,
        doctor_signature: formData.doctor_signature,
        patient_signature: null,
        signed_at: null,
      });

      if (error) throw error;

      toast('success', 'Consent form created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error creating consent:', error);
      toast('error', 'Failed to create consent form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Modal isOpen onClose={onClose} title="Add Consent Form" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Template Selection */}
        <div>
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={useTemplate}
              onChange={(e) => setUseTemplate(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Use existing template
            </span>
          </label>

          {useTemplate && (
            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select a template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.template_name} ({template.procedure_type})
                </option>
              ))}
            </select>
          )}
        </div>

        <Input
          label="Form Type / Procedure Name *"
          name="form_type"
          value={formData.form_type}
          onChange={handleChange}
          placeholder="e.g., General Surgery Consent"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Consent Form Content *
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={10}
            placeholder="Enter the full consent form text..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            AI will automatically analyze and summarize this content
          </p>
        </div>

        <Input
          label="Doctor Signature / ID *"
          name="doctor_signature"
          value={formData.doctor_signature}
          onChange={handleChange}
          placeholder="Dr. Name or Digital Signature ID"
          required
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Patient:</strong> {patient.patient_name} ({patient.patient_id})
          </p>
          <p className="text-sm text-blue-900">
            <strong>Disease:</strong> {patient.disease}
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              'Create Consent Form'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
