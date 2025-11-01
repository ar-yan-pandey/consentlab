'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Hospital, Lock, Mail, Activity, Shield, Stethoscope } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { useHospitalStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function HospitalLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setUser = useHospitalStore((state) => state.setUser);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // In a real app, you'd hash the password and compare
      // For demo purposes, we'll do a simple check
      const { data, error: dbError } = await supabase
        .from('hospital_users')
        .select('*')
        .eq('email', email)
        .single();

      if (dbError || !data) {
        setError('Invalid email or password');
        return;
      }

      // Set user in store
      setUser({
        id: data.id,
        email: data.email,
        role: data.role,
        hospitalName: data.hospital_name,
        fullName: data.full_name,
      });

      // Redirect to dashboard
      router.push('/hospital/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-medical-gradient relative">
      {/* Medical Pattern Overlay */}
      <div className="fixed inset-0 bg-medical-pattern opacity-40 pointer-events-none" />
      
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <Image 
                src="/logo.png" 
                alt="ConsentLab Logo" 
                width={56} 
                height={56}
                className="rounded-xl shadow-medical-lg"
              />
              <span className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">ConsentLab</span>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-medical-lg p-8 border border-emerald-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-4 shadow-lg">
                <Stethoscope className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Hospital Portal</h1>
              <p className="text-gray-600 font-medium">Sign in to manage patient consents</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="doctor@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 text-gray-900"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl shadow-medical hover:shadow-medical-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Need access?{' '}
                <a href="#" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                  Contact Administrator
                </a>
              </p>
            </div>

            <div className="mt-6 text-center">
              <a
                href="/"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 font-medium transition-colors"
              >
                <span>←</span>
                <span>Back to Patient Portal</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
