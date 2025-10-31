// This is what the API returns (password is not included)
export interface AsteriskSettings {
  id: number;
  host: string;
  port: number;
  username: string;
  context: string;
}

export interface AsteriskStatus {
  status: "Connected" | "Disconnected";
  message: string;
}

// This is what we send when CREATING (password is required)
export interface CreateAsteriskSettingsDto {
  host: string;
  port: number;
  username: string;
  password: string;
  context: string;
}

// This is what we send when UPDATING (password is optional)
export interface UpdateAsteriskSettingsDto {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  context?: string;
}
