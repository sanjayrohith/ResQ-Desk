import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { analyzeTranscript } from './client';
import { IncidentData } from './types';

const getInitialState = (): IncidentData => ({
  location: 'Awaiting data...',
  emergency_type: 'Pending',
  severity: 'Normal',
  keywords: [],
  reasoning: 'System standby. Waiting for voice input...',
  confidence_score: 0,
  suggested_unit: '',
});

interface IncidentContextValue {
  incidentData: IncidentData;
  isAnalyzing: boolean;
  showPopup: boolean;
  isOperatorSpeaking: boolean;
  resetKey: number;
  isCritical: boolean;
  setIsOperatorSpeaking: (v: boolean) => void;
  handleLineComplete: (transcript: string) => Promise<void>;
  resetDashboard: () => void;
}

const IncidentContext = createContext<IncidentContextValue | null>(null);

export function IncidentProvider({ children }: { children: React.ReactNode }) {
  const [incidentData, setIncidentData] = useState<IncidentData>(getInitialState());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isOperatorSpeaking, setIsOperatorSpeaking] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const isCritical = (incidentData.severity || '').toLowerCase() === 'critical';

  const resetDashboard = useCallback(() => {
    setShowPopup(false);
    setResetKey(prev => prev + 1);
    setIncidentData(getInitialState());
  }, []);

  const handleLineComplete = useCallback(async (transcript: string) => {
    if (!transcript || transcript.length < 2) return;
    setIsAnalyzing(true);
    try {
      const backendData = await analyzeTranscript(transcript);
      if (backendData.incident_id) {
        setIncidentData(backendData);
        setTimeout(() => setShowPopup(true), 4000);
      }
    } catch (error) {
      console.error('Sync Error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      incidentData,
      isAnalyzing,
      showPopup,
      isOperatorSpeaking,
      resetKey,
      isCritical,
      setIsOperatorSpeaking,
      handleLineComplete,
      resetDashboard,
    }),
    [incidentData, isAnalyzing, showPopup, isOperatorSpeaking, resetKey, isCritical, handleLineComplete, resetDashboard],
  );

  return <IncidentContext.Provider value={value}>{children}</IncidentContext.Provider>;
}

export function useIncident() {
  const ctx = useContext(IncidentContext);
  if (!ctx) throw new Error('useIncident must be used within IncidentProvider');
  return ctx;
}
