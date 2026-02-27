import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Database types
export interface VendorApplication {
  id?: string
  company_name: string
  contact_person: string
  email: string
  phone: string
  business_type: string
  description?: string
  address: string
  city: string
  country: string
  website?: string
  tax_id: string
  bank_name: string
  account_number: string
  status: "pending" | "approved" | "rejected"
  documents?: DocumentUpload[]
  created_at?: string
  user_id?: string
}

export interface ProfessionalApplication {
  id?: string
  company_name: string
  contact_person: string
  email: string
  phone: string
  professional_type: string
  license_number?: string
  address: string
  city: string
  country: string
  epra_license?: string
  status: "pending" | "approved" | "rejected"
  documents?: DocumentUpload[]
  created_at?: string
  user_id?: string
}

export interface CustomerProfile {
  id?: string
  first_name: string
  last_name: string
  email: string
  phone: string
  customer_type: string
  organization_name?: string
  address: string
  city: string
  country: string
  accept_marketing: boolean
  created_at?: string
  user_id?: string
}

export interface DeliveryApplication {
  id?: string
  first_name: string
  last_name: string
  email: string
  phone: string
  national_id: string
  driver_license: string
  vehicle_type: string
  vehicle_registration: string
  address: string
  city: string
  country: string
  emergency_contact_name: string
  emergency_contact_phone: string
  bank_name: string
  account_number: string
  status: "pending" | "approved" | "rejected"
  documents?: DocumentUpload[]
  created_at?: string
  user_id?: string
}

export interface DocumentUpload {
  url: string
  type: string
  name: string
  uploadedAt: string
}

export interface InstallationJob {
  id: string
  customer_id: string
  title: string
  description?: string
  location_address: string
  location_city: string
  location_coordinates?: any
  preferred_date?: string
  urgency: 'low' | 'normal' | 'high' | 'urgent'
  status: 'open' | 'bidding' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  selected_bid_id?: string
  total_product_cost: number
  created_at: string
  updated_at: string
  installation_job_items?: InstallationJobItem[]
  installation_bids?: InstallationBid[]
}

export interface InstallationJobItem {
  id: string
  job_id: string
  product_id: string
  product_name: string
  product_price: number
  quantity: number
  created_at: string
}

export interface InstallationBid {
  id: string
  job_id: string
  professional_id: string
  labor_cost: number
  material_cost: number
  additional_costs: number
  total_bid_amount: number
  estimated_duration_hours?: number
  proposal_notes?: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  created_at: string
  updated_at: string
  installation_jobs?: InstallationJob
}

// Installation Jobs and Bids
export interface InstallationJob {
  id?: string
  customer_id?: string
  title: string
  description?: string
  location_address: string
  location_city: string
  location_coordinates?: string
  preferred_date?: string
  urgency: 'low' | 'normal' | 'high' | 'urgent'
  status: 'open' | 'bidding' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  selected_bid_id?: string
  total_product_cost: number
  items?: InstallationJobItem[]
  bids?: InstallationBid[]
  created_at?: string
  updated_at?: string
}

export interface InstallationJobItem {
  id?: string
  job_id?: string
  product_id: string
  product_name: string
  product_price: number
  quantity: number
  created_at?: string
}

export interface InstallationBid {
  id?: string
  job_id?: string
  professional_id?: string
  labor_cost: number
  material_cost: number
  additional_costs: number
  total_bid_amount: number
  estimated_duration_hours?: number
  proposal_notes?: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  professional_name?: string
  professional_company?: string
  created_at?: string
  updated_at?: string
}
