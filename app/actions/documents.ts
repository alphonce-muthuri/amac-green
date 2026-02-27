"use server"

import { supabaseAdmin } from "@/lib/supabase-server"
import type { DocumentUpload } from "@/lib/supabase"

export async function saveApplicationDocuments(
  applicationId: string,
  applicationType: 'vendor' | 'professional' | 'delivery',
  documents: DocumentUpload[]
) {
  try {
    const tableName = `${applicationType}_applications`
    
    const { error } = await supabaseAdmin
      .from(tableName)
      .update({ documents })
      .eq('id', applicationId)

    if (error) {
      console.error('Error saving documents:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Exception saving documents:', error)
    return { success: false, error: 'Failed to save documents' }
  }
}

export async function getApplicationDocuments(
  applicationId: string,
  applicationType: 'vendor' | 'professional' | 'delivery'
) {
  try {
    const tableName = `${applicationType}_applications`
    
    const { data, error } = await supabaseAdmin
      .from(tableName)
      .select('documents')
      .eq('id', applicationId)
      .single()

    if (error) {
      console.error('Error fetching documents:', error)
      return { success: false, error: error.message }
    }

    return { success: true, documents: data.documents || [] }
  } catch (error) {
    console.error('Exception fetching documents:', error)
    return { success: false, error: 'Failed to fetch documents' }
  }
}