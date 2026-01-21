import { Asset } from '../types';
import { INITIAL_ASSETS } from '../constants';

// Use bracket notation or cast to any to bypass strict ImportMeta property checks in TypeScript environments where env is not defined in types
const API_URL = (import.meta as any).env?.VITE_API_URL || '/api'; 

export class DatabaseService {
  private storageKey = 'nexus_assets_v1';

  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify(INITIAL_ASSETS));
    }
  }

  // --- Assets API ---

  async getAssets(): Promise<Asset[]> {
    try {
      // If VITE_API_URL is set, try to fetch from remote
      if ((import.meta as any).env?.VITE_API_URL) {
        const response = await fetch(`${API_URL}/assets`);
        if (response.ok) return await response.json();
      }
    } catch (error) {
      console.warn('Remote API failed, using LocalStorage');
    }
    return this.getLocalAssets();
  }

  async saveAsset(asset: Asset): Promise<void> {
    try {
      if ((import.meta as any).env?.VITE_API_URL) {
        const response = await fetch(`${API_URL}/assets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(asset)
        });
        if (response.ok) return;
      }
    } catch (error) {
      console.warn('Remote API failed, saving to LocalStorage');
    }
    this.saveLocalAsset(asset);
  }

  async deleteAsset(id: string): Promise<void> {
    try {
      if ((import.meta as any).env?.VITE_API_URL) {
        const response = await fetch(`${API_URL}/assets/${id}`, { method: 'DELETE' });
        if (response.ok) return;
      }
    } catch (error) {
      console.warn('Remote API failed, deleting from LocalStorage');
    }
    this.deleteLocalAsset(id);
  }

  // --- Local Storage Implementation ---

  private getLocalAssets(): Asset[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : INITIAL_ASSETS;
  }

  private saveLocalAsset(asset: Asset) {
    const assets = this.getLocalAssets();
    const index = assets.findIndex(a => a.id === asset.id);
    if (index >= 0) {
      assets[index] = asset;
    } else {
      assets.unshift(asset);
    }
    localStorage.setItem(this.storageKey, JSON.stringify(assets));
  }

  private deleteLocalAsset(id: string) {
    const assets = this.getLocalAssets().filter(a => a.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(assets));
  }
}

export const db = new DatabaseService();