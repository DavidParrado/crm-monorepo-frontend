import { http } from "@/lib/http";

export const initiateCall = (phoneNumber: string): Promise<void> => {
  return http.post<void, { phoneNumber: string }>("asterisk/call", { phoneNumber });
};
