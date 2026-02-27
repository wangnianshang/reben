export interface Note {
  id: number;
  type: 'text' | 'image';
  content: string;
  description?: string; // New field
  created_at: string;
  updated_at: string;
  createdAt?: string; // Mapped from created_at
  updatedAt?: string; // Mapped from updated_at
}

export type CreateNoteDTO = {
  type: 'text' | 'image';
  content: string;
  description?: string;
}
