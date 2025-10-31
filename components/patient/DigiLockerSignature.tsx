'use client';

import { useState } from 'react';
import { Shield, Loader2, CheckCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

interface DigiLockerSignatureProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (signature: string) => void;
}

export default function DigiLockerSignature({ isOpen, onClose, onSuccess }: DigiLockerSignatureProps) {
  const [step, setStep] = useState<'aadhar' | 'otp' | 'success'>('aadhar');
  const [aadharNumber, setAadharNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAadharSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (aadharNumber.length !== 12) {
      toast('error', 'Please enter a valid 12-digit Aadhaar number');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      toast('info', 'OTP sent to your registered mobile number');
    }, 1500);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast('error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    // Simulate OTP verification
    setTimeout(() => {
      setLoading(false);
      setStep('success');
      
      // Generate signature
      const signature = `DIGILOCKER_${aadharNumber.slice(-4)}_${Date.now()}`;
      
      setTimeout(() => {
        onSuccess(signature);
        toast('success', 'Document signed successfully!');
        onClose();
        // Reset for next time
        setTimeout(() => {
          setStep('aadhar');
          setAadharNumber('');
          setOtp('');
        }, 500);
      }, 2000);
    }, 1500);
  };

  const handleClose = () => {
    if (step !== 'success') {
      onClose();
      // Reset after close
      setTimeout(() => {
        setStep('aadhar');
        setAadharNumber('');
        setOtp('');
      }, 300);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Digital Signature" size="sm">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
          <span>Powered by</span>
          <span className="font-semibold text-blue-600">DigiLocker</span>
        </p>
      </div>

      {step === 'aadhar' && (
        <form onSubmit={handleAadharSubmit} className="space-y-4">
          <div>
            <Input
              label="Aadhaar Number"
              type="text"
              value={aadharNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                setAadharNumber(value);
              }}
              placeholder="XXXX XXXX XXXX"
              required
              maxLength={12}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your 12-digit Aadhaar number
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading || aadharNumber.length !== 12}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Sending OTP...
              </>
            ) : (
              'Send OTP'
            )}
          </Button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              <strong>Secure & Verified:</strong> Your Aadhaar details are encrypted and verified through DigiLocker.
            </p>
          </div>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <div>
            <Input
              label="Enter OTP"
              type="text"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(value);
              }}
              placeholder="XXXXXX"
              required
              maxLength={6}
              className="text-center text-2xl tracking-widest"
            />
            <p className="text-xs text-gray-500 mt-1">
              OTP sent to your registered mobile number
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              'Verify & Sign'
            )}
          </Button>

          <button
            type="button"
            onClick={() => setStep('aadhar')}
            className="w-full text-sm text-gray-600 hover:text-gray-900"
          >
            ← Change Aadhaar Number
          </button>
        </form>
      )}

      {step === 'success' && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Successfully Signed!
          </h3>
          <p className="text-gray-600">
            Your digital signature has been applied to the consent form.
          </p>
        </div>
      )}
    </Modal>
  );
}
