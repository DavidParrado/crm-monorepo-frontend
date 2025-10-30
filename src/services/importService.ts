import { http } from "@/lib/http";
import { Import, ImportPreview, ImportUploadResponse } from "@/types/import";

/**
 * Uploads a file for preview/parsing.
 */
export const parsePreview = (formData: FormData): Promise<ImportPreview> => {
  return http.postForm<ImportPreview>("imports/parse-preview", formData);
};

/**
 * Uploads the file with mapping to process the import.
 */
export const uploadFile = (formData: FormData): Promise<ImportUploadResponse> => {
  return http.postForm<ImportUploadResponse>("imports/upload", formData);
};

/**
 * Gets the list of past imports.
 */
export const getHistory = (): Promise<Import[]> => {
  return http.get<Import[]>("imports");
};

/**
 * Deletes an import and its related data.
 */
export const deleteImport = (id: number): Promise<void> => {
  return http.del<void>(`imports/${id}`);
};
