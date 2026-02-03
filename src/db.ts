import Dexie, { type EntityTable } from 'dexie';
import type { Note } from './types';

const db = new Dexie('NotesDatabase') as Dexie & {
  notes: EntityTable<Note, 'id'>;
};

db.version(1).stores({
  notes: '++id, type, title, content, createdAt, updatedAt'
});

export { db };

// CRUD Operations
export async function getAllNotes(): Promise<Note[]> {
  return db.notes.orderBy('updatedAt').reverse().toArray();
}

export async function getNoteById(id: number): Promise<Note | undefined> {
  return db.notes.get(id);
}

export async function createNote(note: Omit<Note, 'id'>): Promise<number> {
  const id = await db.notes.add(note as Note);
  return id as number;
}

export async function updateNote(id: number, updates: Partial<Note>): Promise<number> {
  return db.notes.update(id, { ...updates, updatedAt: new Date() });
}

export async function deleteNote(id: number): Promise<void> {
  return db.notes.delete(id);
}

export async function searchNotes(query: string): Promise<Note[]> {
  const lowerQuery = query.toLowerCase();
  const allNotes = await getAllNotes();
  
  return allNotes.filter(note => {
    const titleMatch = note.title.toLowerCase().includes(lowerQuery);
    const contentMatch = note.content?.toLowerCase().includes(lowerQuery);
    const itemsMatch = note.items?.some(item => 
      item.text.toLowerCase().includes(lowerQuery)
    );
    
    return titleMatch || contentMatch || itemsMatch;
  });
}
