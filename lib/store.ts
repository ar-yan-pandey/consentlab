import { create } from 'zustand';

interface HospitalUser {
  id: string;
  email: string;
  role: 'admin' | 'doctor' | 'consent_officer';
  hospitalName: string;
  fullName: string;
}

interface HospitalStore {
  user: HospitalUser | null;
  setUser: (user: HospitalUser | null) => void;
  logout: () => void;
}

export const useHospitalStore = create<HospitalStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

interface ConsentData {
  content: string;
  summary: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  patientInfo?: any;
}

interface PatientStore {
  consentData: ConsentData | null;
  selectedLanguage: string;
  setConsentData: (data: ConsentData | null) => void;
  setSelectedLanguage: (language: string) => void;
}

export const usePatientStore = create<PatientStore>((set) => ({
  consentData: null,
  selectedLanguage: 'en',
  setConsentData: (data) => set({ consentData: data }),
  setSelectedLanguage: (language) => set({ selectedLanguage: language }),
}));
