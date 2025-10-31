import { http } from "@/lib/http";
import { 
  AsteriskSettings, 
  AsteriskStatus, 
  CreateAsteriskSettingsDto, 
  UpdateAsteriskSettingsDto 
} from "@/types/asterisk";

/**
 * Fetches the current Asterisk settings.
 */
export const getSettings = (): Promise<AsteriskSettings> => {
  return http.get<AsteriskSettings>("asterisk/settings");
};

/**
 * Fetches the current Asterisk connection status.
 */
export const getStatus = (): Promise<AsteriskStatus> => {
  return http.get<AsteriskStatus>("asterisk/status");
};

/**
 * Creates new Asterisk settings.
 */
export const createSettings = (data: CreateAsteriskSettingsDto): Promise<AsteriskSettings> => {
  return http.post<AsteriskSettings, CreateAsteriskSettingsDto>("asterisk/settings", data);
};

/**
 * Updates existing Asterisk settings.
 */
export const updateSettings = (data: UpdateAsteriskSettingsDto): Promise<AsteriskSettings> => {
  return http.patch<AsteriskSettings, UpdateAsteriskSettingsDto>("asterisk/settings", data);
};

/**
 * Initiates a call to the specified phone number.
 */
export const initiateCall = (phoneNumber: string): Promise<void> => {
  return http.post<void, { phoneNumber: string }>("asterisk/call", { phoneNumber });
};
