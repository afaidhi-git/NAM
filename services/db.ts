
import { Asset } from '../types';
import { INITIAL_ASSETS } from '../constants';

// Use relative URL so it works in dev (via vite proxy) and prod (via nginx)
const API_URL = '/api'; 

export class DatabaseService {
  
  // --- Assets API ---

  async getAssets(): Promise<Asset[]> {
    try {
      const response = await fetch(`${API_URL}/assets`);
      if (!response.ok) throw new Error('Network response was not ok');
      const assets = await response.json();
      return assets;
    } catch (error) {
      console.warn('API unavailable, falling back to local storage:', error);
      return this.getLocalAssets();
    }
  }

  async saveAsset(asset: Asset): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asset)
      });
      if (!response.ok) throw new Error('API Error');
    } catch (error) {
      console.warn('API unavailable, saving locally:', error);
      this.saveLocalAsset(asset);
    }
  }

  async deleteAsset(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/assets/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('API Error');
    } catch (error) {
      console.warn('API unavailable, deleting locally:', error);
      this.deleteLocalAsset(id);
    }
  }

  // --- Local Storage Helpers ---

  private getLocalAssets(): Asset[] {
    const stored = localStorage.getItem('nexus_assets');
    if (stored) return JSON.parse(stored);
    // Initialize with mock data if empty
    localStorage.setItem('nexus_assets', JSON.stringify(INITIAL_ASSETS));
    return INITIAL_ASSETS;
  }

  private saveLocalAsset(asset: Asset) {
    const assets = this.getLocalAssets();
    const index = assets.findIndex(a => a.id === asset.id);
    if (index >= 0) {
      assets[index] = asset;
    } else {
      assets.unshift(asset);
    }
    localStorage.setItem('nexus_assets', JSON.stringify(assets));
  }

  private deleteLocalAsset(id: string) {
    const assets = this.getLocalAssets().filter(a => a.id !== id);
    localStorage.setItem('nexus_assets', JSON.stringify(assets));
  }
}

export const db = new DatabaseService();
