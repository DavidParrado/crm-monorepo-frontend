/**
 * Type for API endpoints that don't require a request body
 * Use this instead of {} for better type safety and clarity
 */
export type EmptyRequestBody = Record<string, never>;
