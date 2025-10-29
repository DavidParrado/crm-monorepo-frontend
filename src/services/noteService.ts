import { http } from "@/lib/http";
import { Note } from "@/types/notes";
import { Management } from "@/types/management";
import { PaginatedResponse } from "@/types/api";

// --- Managements ---

export const getManagements = (): Promise<Management[]> => {
  return http.get<Management[]>("managements");
};

// --- Notes ---

export const getNotesForClient = (
  clientId: number,
  params: URLSearchParams
): Promise<PaginatedResponse<Note>> => {
  return http.get<PaginatedResponse<Note>>(`notes/client/${clientId}`, params);
};

interface CreateNoteData {
  clientId: number;
  content: string;
  managementId: number;
}

export const createNote = (data: CreateNoteData): Promise<Note> => {
  return http.post<Note, CreateNoteData>("notes", data);
};
