import { Asset } from '../types';
import { supabase } from './supabaseService';

export class DatabaseService {
  private ensureClient() {
    if (!supabase) {
      throw new Error('Supabase client is not initialized. Please check your environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).');
    }
    return supabase;
  }

  async getAssets(): Promise<Asset[]> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }
    return data || [];
  }

  async saveAsset(asset: Asset): Promise<void> {
    const client = this.ensureClient();
    const { id, ...assetData } = asset;

    const { error } = await client
      .from('assets')
      .upsert({ id, ...assetData });

    if (error) {
      console.error('Error saving asset:', error);
      throw error;
    }
  }

  async deleteAsset(id: string): Promise<void> {
    const client = this.ensureClient();
    const { error } = await client
      .from('assets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting asset:', error);
      throw error;
    }
  }
}

export const db = new DatabaseService();