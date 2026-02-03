export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  order: number;
}

export interface Note {
  id?: number;
  type: 'note' | 'checklist';
  title: string;
  content?: string;
  items?: ChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export type NoteType = 'note' | 'checklist';
