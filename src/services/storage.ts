import { Reading } from '../types/reading';

// Storage service abstraction - currently uses localStorage
// Future: Can be migrated to IndexedDB or backend API
class StorageService {
  private readonly READINGS_KEY = 'tarot_readings';
  private readonly CARD_NOTES_KEY = 'tarot_card_notes';

  // Reading operations
  async saveReading(reading: Reading): Promise<void> {
    const readings = await this.getReadings();
    const existingIndex = readings.findIndex(r => r.id === reading.id);
    
    if (existingIndex >= 0) {
      readings[existingIndex] = reading;
    } else {
      readings.push(reading);
    }

    localStorage.setItem(this.READINGS_KEY, JSON.stringify(readings));
  }

  async getReadings(): Promise<Reading[]> {
    const data = localStorage.getItem(this.READINGS_KEY);
    if (!data) return [];

    try {
      const readings = JSON.parse(data);
      // Convert date strings back to Date objects
      return readings.map((reading: any) => ({
        ...reading,
        createdAt: new Date(reading.createdAt),
        updatedAt: new Date(reading.updatedAt),
        cards: reading.cards.map((card: any) => ({
          ...card,
          drawnAt: new Date(card.drawnAt),
        })),
      }));
    } catch (error) {
      console.error('Error parsing readings from storage:', error);
      return [];
    }
  }

  async deleteReading(readingId: string): Promise<void> {
    const readings = await this.getReadings();
    const filtered = readings.filter(r => r.id !== readingId);
    localStorage.setItem(this.READINGS_KEY, JSON.stringify(filtered));
  }

  // Card notes operations (future)
  private getCardNotesSync(): Record<string, any[]> {
    const data = localStorage.getItem(this.CARD_NOTES_KEY);
    if (!data) return {};
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  async saveCardNotes(cardId: string, notes: any[]): Promise<void> {
    const allNotes = this.getCardNotesSync();
    allNotes[cardId] = notes;
    localStorage.setItem(this.CARD_NOTES_KEY, JSON.stringify(allNotes));
  }

  async getCardNotes(cardId: string): Promise<any[]> {
    const allNotes = this.getCardNotesSync();
    return allNotes[cardId] || [];
  }
}

// Export singleton instance
export const storageService = new StorageService();
