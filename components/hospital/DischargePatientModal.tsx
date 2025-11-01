'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, FileText, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';

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
}

interface DischargeTemplate {
  id: string;
  template_name: string;
  disease_category: string;
  discharge_instructions: string;
  follow_up_instructions: string;
  precautions: string;
  diet_instructions: string | null;
  medication_instructions: string | null;
}

interface Expense {
  id: string;
  expense_category: string;
  expense_description: string;
  amount: number;
  quantity: number;
}

interface DischargePatientModalProps {
  patient: Patient;
  onClose: () => void;
  onSuccess: () => void;
}

const EXPENSE_CATEGORIES = [
  'Room Charges',
  'Doctor Consultation',
  'Nursing Care',
  'Medicines',
  'Laboratory Tests',
  'Radiology/Imaging',
  'Surgery/Procedure',
  'Medical Supplies',
  'Physiotherapy',
  'Other Services',
];

export default function DischargePatientModal({ patient, onClose, onSuccess }: DischargePatientModalProps) {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<DischargeTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [useTemplate, setUseTemplate] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Discharge form data
  const [dischargeDate, setDischargeDate] = useState(new Date().toISOString().split('T')[0]);
  const [diagnosis, setDiagnosis] = useState(patient.disease);
  const [treatmentGiven, setTreatmentGiven] = useState(patient.treatment_course);
  const [dischargeCondition, setDischargeCondition] = useState('Stable');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpInstructions, setFollowUpInstructions] = useState('');
  const [precautions, setPrecautions] = useState('');
  const [dietInstructions, setDietInstructions] = useState('');
  const [medicationInstructions, setMedicationInstructions] = useState('');
  const [furtherCare, setFurtherCare] = useState('');

  // Billing data
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', expense_category: 'Room Charges', expense_description: '', amount: 0, quantity: 1 }
  ]);
  const [taxPercentage, setTaxPercentage] = useState(5);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    setMounted(true);
    fetchTemplates();
    return () => setMounted(false);
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('discharge_templates')
        .select('*')
        .order('template_name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFollowUpInstructions(template.follow_up_instructions);
      setPrecautions(template.precautions);
      setDietInstructions(template.diet_instructions || '');
      setMedicationInstructions(template.medication_instructions || '');
    }
  };

  const addExpense = () => {
    setExpenses([
      ...expenses,
      {
        id: Date.now().toString(),
        expense_category: 'Room Charges',
        expense_description: '',
        amount: 0,
        quantity: 1,
      },
    ]);
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const updateExpense = (id: string, field: keyof Expense, value: any) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const calculateSubtotal = () => {
    return expenses.reduce((sum, exp) => sum + (exp.amount * exp.quantity), 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * taxPercentage) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - discountAmount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create discharge summary
      const { data: dischargeSummary, error: summaryError } = await supabase
        .from('discharge_summaries')
        .insert({
          patient_id: patient.patient_id,
          discharge_date: dischargeDate,
          diagnosis,
          treatment_given: treatmentGiven,
          discharge_condition: dischargeCondition,
          follow_up_date: followUpDate || null,
          follow_up_instructions: followUpInstructions,
          precautions,
          diet_instructions: dietInstructions || null,
          medication_instructions: medicationInstructions || null,
          further_care: furtherCare || null,
        })
        .select()
        .single();

      if (summaryError) throw summaryError;

      // 2. Add billing expenses
      const expenseRecords = expenses.map(exp => ({
        discharge_summary_id: dischargeSummary.id,
        expense_category: exp.expense_category,
        expense_description: exp.expense_description,
        amount: exp.amount,
        quantity: exp.quantity,
      }));

      const { error: expensesError } = await supabase
        .from('billing_expenses')
        .insert(expenseRecords);

      if (expensesError) throw expensesError;

      // 3. Create discharge bill
      const subtotal = calculateSubtotal();
      const taxAmount = calculateTax();
      const totalAmount = calculateTotal();

      const { error: billError } = await supabase
        .from('discharge_bills')
        .insert({
          discharge_summary_id: dischargeSummary.id,
          patient_id: patient.patient_id,
          subtotal,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          payment_status: 'pending',
        });

      if (billError) throw billError;

      // 4. Update patient discharge status
      const { error: patientError } = await supabase
        .from('patients')
        .update({ discharge_status: 'ready_for_discharge' })
        .eq('patient_id', patient.patient_id);

      if (patientError) throw patientError;

      toast('success', 'Patient discharge summary created successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating discharge summary:', error);
      toast('error', 'Failed to create discharge summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <>
      <style jsx global>{`
        body {
          overflow: hidden;
        }
      `}</style>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" 
        style={{ zIndex: 10000 }}
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full my-8 max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 rounded-t-3xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Discharge Patient</h2>
            <p className="text-emerald-50 mt-1">
              {patient.patient_name} (ID: {patient.patient_id})
            </p>
          </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              type="button"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Template Selection */}
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-emerald-600" />
              <h3 className="text-xl font-bold text-gray-900">Discharge Template</h3>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={useTemplate}
                  onChange={() => setUseTemplate(true)}
                  className="w-4 h-4 text-emerald-600"
                />
                <span className="font-medium text-gray-700">Use Template</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!useTemplate}
                  onChange={() => setUseTemplate(false)}
                  className="w-4 h-4 text-emerald-600"
                />
                <span className="font-medium text-gray-700">Create New</span>
              </label>
            </div>

            {useTemplate && (
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
              >
                <option value="">Select a template...</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.template_name} - {template.disease_category}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Discharge Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Discharge Details
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discharge Date *
                </label>
                <input
                  type="date"
                  value={dischargeDate}
                  onChange={(e) => setDischargeDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discharge Condition *
                </label>
                <select
                  value={dischargeCondition}
                  onChange={(e) => setDischargeCondition(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                >
                  <option value="Stable">Stable</option>
                  <option value="Improved">Improved</option>
                  <option value="Recovered">Recovered</option>
                  <option value="Against Medical Advice">Against Medical Advice</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Diagnosis *
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Treatment Given *
              </label>
              <textarea
                value={treatmentGiven}
                onChange={(e) => setTreatmentGiven(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Follow-up Instructions *
              </label>
              <textarea
                value={followUpInstructions}
                onChange={(e) => setFollowUpInstructions(e.target.value)}
                required
                rows={3}
                placeholder="Follow up with doctor in X days..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Precautions *
              </label>
              <textarea
                value={precautions}
                onChange={(e) => setPrecautions(e.target.value)}
                required
                rows={4}
                placeholder="1. Keep wound clean and dry&#10;2. Avoid heavy lifting..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all resize-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Diet Instructions
                </label>
                <textarea
                  value={dietInstructions}
                  onChange={(e) => setDietInstructions(e.target.value)}
                  rows={3}
                  placeholder="Follow a balanced diet..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Medication Instructions
                </label>
                <textarea
                  value={medicationInstructions}
                  onChange={(e) => setMedicationInstructions(e.target.value)}
                  rows={3}
                  placeholder="Take prescribed medications..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all resize-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Further Course of Care
              </label>
              <textarea
                value={furtherCare}
                onChange={(e) => setFurtherCare(e.target.value)}
                rows={3}
                placeholder="Additional care instructions..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all resize-none"
              />
            </div>
          </div>

          {/* Billing Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Billing & Expenses
              </h3>
              <Button type="button" onClick={addExpense} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>

            <div className="space-y-3">
              {expenses.map((expense, index) => (
                <div key={expense.id} className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                  <div className="grid md:grid-cols-12 gap-3 items-start">
                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Category
                      </label>
                      <select
                        value={expense.expense_category}
                        onChange={(e) => updateExpense(expense.id, 'expense_category', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      >
                        {EXPENSE_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-4">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={expense.expense_description}
                        onChange={(e) => updateExpense(expense.id, 'expense_description', e.target.value)}
                        required
                        placeholder="Enter description..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={expense.quantity}
                        onChange={(e) => updateExpense(expense.id, 'quantity', parseInt(e.target.value) || 1)}
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={expense.amount}
                        onChange={(e) => updateExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>

                    <div className="md:col-span-1 flex items-end">
                      {expenses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExpense(expense.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Summary */}
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 space-y-3">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tax (%)
                  </label>
                  <input
                    type="number"
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-4 py-2 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Discount (₹)
                  </label>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Subtotal:</span>
                  <span className="font-semibold text-gray-900">₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Tax ({taxPercentage}%):</span>
                  <span className="font-semibold text-gray-900">₹{calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Discount:</span>
                  <span className="font-semibold text-red-600">-₹{discountAmount.toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-emerald-300 pt-2 flex justify-between">
                  <span className="font-bold text-gray-900 text-lg">Total Amount:</span>
                  <span className="font-bold text-emerald-600 text-xl">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alert */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Important:</p>
              <p>Patient will be able to view discharge summary and make payment through their portal using their Patient ID.</p>
            </div>
          </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t-2 border-gray-200">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating Discharge...' : 'Create Discharge Summary'}
              </Button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
