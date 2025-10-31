import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      hospital_users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          role: 'admin' | 'doctor' | 'consent_officer';
          hospital_name: string;
          full_name: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['hospital_users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['hospital_users']['Insert']>;
      };
      patients: {
        Row: {
          id: string;
          patient_id: string;
          patient_name: string;
          age: number;
          gender: string;
          disease: string;
          doctor_assigned: string;
          treatment_course: string;
          admission_date: string;
          expected_discharge_date: string;
          notes: string;
          hospital_user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['patients']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['patients']['Insert']>;
      };
      consent_forms: {
        Row: {
          id: string;
          patient_id: string;
          form_type: string;
          content: string;
          summary: string;
          risk_level: 'low' | 'medium' | 'high';
          risk_factors: string[];
          doctor_signature: string;
          patient_signature: string | null;
          signed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['consent_forms']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['consent_forms']['Insert']>;
      };
      consent_templates: {
        Row: {
          id: string;
          template_name: string;
          procedure_type: string;
          content: string;
          risk_level: 'low' | 'medium' | 'high';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['consent_templates']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['consent_templates']['Insert']>;
      };
    };
  };
};
