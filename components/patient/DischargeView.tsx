'use client';

import { useState, useEffect } from 'react';
import { FileText, Calendar, DollarSign, Download, CreditCard, CheckCircle, AlertCircle, Heart, Stethoscope } from 'lucide-react';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';

interface DischargeSummary {
  id: string;
  discharge_date: string;
  diagnosis: string;
  treatment_given: string;
  discharge_condition: string;
  follow_up_date: string | null;
  follow_up_instructions: string;
  precautions: string;
  diet_instructions: string | null;
  medication_instructions: string | null;
  further_care: string | null;
}

interface BillingExpense {
  id: string;
  expense_category: string;
  expense_description: string;
  amount: number;
  quantity: number;
}

interface DischargeBill {
  id: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_status: string;
  payment_method: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  paid_at: string | null;
}

interface DischargeViewProps {
  patientId: string;
  patientName: string;
}

export default function DischargeView({ patientId, patientName }: DischargeViewProps) {
  const [loading, setLoading] = useState(true);
  const [dischargeSummary, setDischargeSummary] = useState<DischargeSummary | null>(null);
  const [expenses, setExpenses] = useState<BillingExpense[]>([]);
  const [bill, setBill] = useState<DischargeBill | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    loadDischargeData();
  }, [patientId]);

  const loadDischargeData = async () => {
    setLoading(true);
    try {
      // Load discharge summary
      const { data: summaryData, error: summaryError } = await supabase
        .from('discharge_summaries')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (summaryError) throw summaryError;
      setDischargeSummary(summaryData);

      // Load expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('billing_expenses')
        .select('*')
        .eq('discharge_summary_id', summaryData.id);

      if (expensesError) throw expensesError;
      setExpenses(expensesData || []);

      // Load bill
      const { data: billData, error: billError } = await supabase
        .from('discharge_bills')
        .select('*')
        .eq('discharge_summary_id', summaryData.id)
        .single();

      if (billError) throw billError;
      setBill(billData);
    } catch (error) {
      console.error('Error loading discharge data:', error);
      toast('error', 'Failed to load discharge information');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!bill) return;

    setProcessingPayment(true);
    try {
      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummy', // Replace with your Razorpay key
          amount: Math.round(bill.total_amount * 100), // Amount in paise
          currency: 'INR',
          name: 'ConsentLab',
          description: `Discharge Bill - ${patientId}`,
          image: '/logo.png', // Add your logo
          order_id: bill.razorpay_order_id || undefined,
          handler: async function (response: any) {
            try {
              // Update payment status
              const { error } = await supabase
                .from('discharge_bills')
                .update({
                  payment_status: 'paid',
                  payment_method: 'razorpay',
                  razorpay_payment_id: response.razorpay_payment_id,
                  paid_at: new Date().toISOString(),
                })
                .eq('id', bill.id);

              if (error) throw error;

              // Update patient discharge status
              await supabase
                .from('patients')
                .update({ discharge_status: 'discharged' })
                .eq('patient_id', patientId);

              toast('success', 'Payment successful! You are now discharged.');
              loadDischargeData();
            } catch (error) {
              console.error('Error updating payment:', error);
              toast('error', 'Payment recorded but failed to update status');
            }
          },
          prefill: {
            name: patientName,
          },
          theme: {
            color: '#10b981',
          },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
        setProcessingPayment(false);
      };

      script.onerror = () => {
        toast('error', 'Failed to load payment gateway');
        setProcessingPayment(false);
      };
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast('error', 'Failed to initiate payment');
      setProcessingPayment(false);
    }
  };

  const downloadSummary = () => {
    // Create a simple text version for download
    if (!dischargeSummary) return;

    const content = `
DISCHARGE SUMMARY
=================

Patient ID: ${patientId}
Patient Name: ${patientName}
Discharge Date: ${formatDate(dischargeSummary.discharge_date)}
Discharge Condition: ${dischargeSummary.discharge_condition}

DIAGNOSIS
---------
${dischargeSummary.diagnosis}

TREATMENT GIVEN
---------------
${dischargeSummary.treatment_given}

FOLLOW-UP INSTRUCTIONS
----------------------
${dischargeSummary.follow_up_instructions}
${dischargeSummary.follow_up_date ? `Follow-up Date: ${formatDate(dischargeSummary.follow_up_date)}` : ''}

PRECAUTIONS
-----------
${dischargeSummary.precautions}

${dischargeSummary.diet_instructions ? `DIET INSTRUCTIONS\n-----------------\n${dischargeSummary.diet_instructions}\n` : ''}
${dischargeSummary.medication_instructions ? `MEDICATION INSTRUCTIONS\n-----------------------\n${dischargeSummary.medication_instructions}\n` : ''}
${dischargeSummary.further_care ? `FURTHER CARE\n------------\n${dischargeSummary.further_care}\n` : ''}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discharge-summary-${patientId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!dischargeSummary || !bill) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">No discharge information available</p>
        <p className="text-gray-500 text-sm mt-2">Please contact the hospital if you believe this is an error</p>
      </div>
    );
  }

  const isPaid = bill.payment_status === 'paid';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-8 h-8" />
              <h2 className="text-3xl font-bold">Discharge Summary</h2>
            </div>
            <p className="text-emerald-50 text-lg">
              {patientName} (ID: {patientId})
            </p>
          </div>
          {isPaid && (
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold text-lg">Paid</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Status Alert */}
      {!isPaid && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-amber-900 text-lg mb-1">Payment Pending</h3>
            <p className="text-amber-800">
              Please complete the payment to finalize your discharge process. You can download your discharge summary after payment.
            </p>
          </div>
        </div>
      )}

      {/* Discharge Details */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-medical-lg border border-emerald-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Stethoscope className="w-6 h-6 text-emerald-600" />
          <h3 className="text-2xl font-bold text-gray-900">Medical Information</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Discharge Date</label>
            <p className="text-gray-900 font-medium">{formatDate(dischargeSummary.discharge_date)}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Discharge Condition</label>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
              {dischargeSummary.discharge_condition}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="font-bold text-gray-900 mb-2 text-lg">Diagnosis</h4>
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">{dischargeSummary.diagnosis}</p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2 text-lg">Treatment Given</h4>
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">{dischargeSummary.treatment_given}</p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2 text-lg">Follow-up Instructions</h4>
            <p className="text-gray-700 leading-relaxed bg-emerald-50 p-4 rounded-xl border-2 border-emerald-200">
              {dischargeSummary.follow_up_instructions}
            </p>
            {dischargeSummary.follow_up_date && (
              <div className="mt-3 flex items-center gap-2 text-emerald-700">
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">Follow-up Date: {formatDate(dischargeSummary.follow_up_date)}</span>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2 text-lg">Precautions</h4>
            <div className="text-gray-700 leading-relaxed bg-amber-50 p-4 rounded-xl border-2 border-amber-200 whitespace-pre-line">
              {dischargeSummary.precautions}
            </div>
          </div>

          {dischargeSummary.diet_instructions && (
            <div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">Diet Instructions</h4>
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">{dischargeSummary.diet_instructions}</p>
            </div>
          )}

          {dischargeSummary.medication_instructions && (
            <div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">Medication Instructions</h4>
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">{dischargeSummary.medication_instructions}</p>
            </div>
          )}

          {dischargeSummary.further_care && (
            <div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">Further Course of Care</h4>
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">{dischargeSummary.further_care}</p>
            </div>
          )}
        </div>
      </div>

      {/* Billing Information */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-medical-lg border border-emerald-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="w-6 h-6 text-emerald-600" />
          <h3 className="text-2xl font-bold text-gray-900">Billing Details</h3>
        </div>

        <div className="space-y-3 mb-6">
          {expenses.map((expense) => (
            <div key={expense.id} className="flex justify-between items-center py-3 border-b border-gray-200">
              <div>
                <p className="font-semibold text-gray-900">{expense.expense_category}</p>
                <p className="text-sm text-gray-600">{expense.expense_description}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  ₹{expense.amount.toFixed(2)} × {expense.quantity}
                </p>
                <p className="text-sm text-gray-600">₹{(expense.amount * expense.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 space-y-3">
          <div className="flex justify-between text-gray-700">
            <span className="font-medium">Subtotal:</span>
            <span className="font-semibold">₹{bill.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span className="font-medium">Tax:</span>
            <span className="font-semibold">₹{bill.tax_amount.toFixed(2)}</span>
          </div>
          {bill.discount_amount > 0 && (
            <div className="flex justify-between text-red-600">
              <span className="font-medium">Discount:</span>
              <span className="font-semibold">-₹{bill.discount_amount.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t-2 border-emerald-300 pt-3 flex justify-between">
            <span className="font-bold text-gray-900 text-xl">Total Amount:</span>
            <span className="font-bold text-emerald-600 text-2xl">₹{bill.total_amount.toFixed(2)}</span>
          </div>
        </div>

        {isPaid && bill.paid_at && (
          <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Payment Completed</p>
              <p className="text-sm text-green-700">Paid on {formatDate(bill.paid_at)}</p>
              {bill.razorpay_payment_id && (
                <p className="text-xs text-green-600 mt-1">Payment ID: {bill.razorpay_payment_id}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        {isPaid && (
          <Button variant="outline" onClick={downloadSummary}>
            <Download className="w-5 h-5 mr-2" />
            Download Summary
          </Button>
        )}
        {!isPaid && (
          <Button onClick={handlePayment} disabled={processingPayment} size="lg">
            <CreditCard className="w-5 h-5 mr-2" />
            {processingPayment ? 'Processing...' : `Pay ₹${bill.total_amount.toFixed(2)}`}
          </Button>
        )}
      </div>
    </div>
  );
}
