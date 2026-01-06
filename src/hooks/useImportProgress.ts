import { useState, useEffect, useCallback, useRef } from 'react';
import { getImportStatus } from '@/services/importService';
import { ImportStatusResponse, ImportStatus } from '@/types/import';

interface UseImportProgressOptions {
  importId: number | null;
  pollingInterval?: number; // default 2000ms
  onComplete?: (result: ImportStatusResponse) => void;
  onError?: (error: Error) => void;
}

const TERMINAL_STATUSES: ImportStatus[] = ['Completed', 'Completed with errors', 'Failed'];

export const useImportProgress = (options: UseImportProgressOptions) => {
  const { importId, pollingInterval = 2000, onComplete, onError } = options;
  
  const [status, setStatus] = useState<ImportStatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isTerminalStatus = useCallback((s: ImportStatus) => 
    TERMINAL_STATUSES.includes(s), []);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (!importId) return;
    setIsPolling(true);
    setError(null);
    setStatus(null);
  }, [importId]);

  const reset = useCallback(() => {
    stopPolling();
    setStatus(null);
    setError(null);
  }, [stopPolling]);

  useEffect(() => {
    if (!isPolling || !importId) return;

    const poll = async () => {
      try {
        const result = await getImportStatus(importId);
        setStatus(result);

        if (isTerminalStatus(result.status)) {
          stopPolling();
          onComplete?.(result);
        }
      } catch (err) {
        setError(err as Error);
        stopPolling();
        onError?.(err as Error);
      }
    };

    // Execute immediately
    poll();
    
    // Then set up interval
    intervalRef.current = setInterval(poll, pollingInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPolling, importId, pollingInterval, onComplete, onError, isTerminalStatus, stopPolling]);

  // Auto-start polling when importId is set
  useEffect(() => {
    if (importId && !isPolling) {
      startPolling();
    }
  }, [importId, isPolling, startPolling]);

  return {
    status,
    isPolling,
    error,
    startPolling,
    stopPolling,
    reset,
    isComplete: status ? isTerminalStatus(status.status) : false,
  };
};
