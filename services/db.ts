
import { Asset } from '../types';
import { supabase } from './supabaseService'; // Import Supabase client

export class DatabaseService {
  constructor() {
    // No initialization needed for LocalStorage
  }

  // --- Assets API (using Supabase) ---

  async getAssets(): Promise<Asset[]> {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false }); // Assuming 'created_at' column in Supabase

    if (error) {
      console.error('Error fetching assets from Supabase:', error);
      throw error;
    }
    return data || [];
  }

  async saveAsset(asset: Asset): Promise<void> {
    const { id, ...assetData } = asset; // Separate id for upsert

    // Supabase upsert requires id for update, creates new if id doesn't exist
    const { error } = await supabase
      .from('assets')
      .upsert({ id, ...assetData });

    if (error) {
      console.error('Error saving asset to Supabase:', error);
      throw error;
    }
  }

  async deleteAsset(id: string): Promise<void> {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting asset from Supabase:', error);
      throw error;
    }
  }
}

export const db = new DatabaseService();