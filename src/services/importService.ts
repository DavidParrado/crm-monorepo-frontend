import { http } from "@/lib/http";
import { Import, ImportPreview, ImportUploadResponse, ImportStatusResponse } from "@/types/import";

/**
 * Uploads a file for preview/parsing.
 */
export const parsePreview = (formData: FormData): Promise<ImportPreview> => {
  return http.postForm<ImportPreview>("imports/parse-preview", formData);
};

/**
 * Uploads the file with mapping to process the import.
 * Now returns immediately with importId for async processing.
 */
export const uploadFile = (formData: FormData): Promise<ImportUploadResponse> => {
  return http.postForm<ImportUploadResponse>("imports/upload", formData);
};

/**
 * Gets the status of an import job (polling endpoint).
 * Queries Redis if job is active, or DB if completed.
 */
export const getImportStatus = (id: number): Promise<ImportStatusResponse> => {
  return http.get<ImportStatusResponse>(`imports/status/${id}`);
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
