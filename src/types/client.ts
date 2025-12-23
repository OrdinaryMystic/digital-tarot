export interface Client {
  id: string;
  name: string;
  email?: string;
  notes?: string;
  createdAt: Date;
  readings: string[];            // Array of reading IDs
}

