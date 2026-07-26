import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Panel } from '../components/ui/Panel';
import { LiveCall } from '../components/dashboard/LiveCall';
import { LiveTranscription } from '../components/dashboard/LiveTranscription';
import { useIncident } from '../api/IncidentContext';

export function CommsScreen() {
  const { isOperatorSpeaking, setIsOperatorSpeaking, handleLineComplete } = useIncident();

  return (
    <View style={styles.container}>
      <Panel glow style={styles.callPanel}>
        <LiveCall onPTTChange={setIsOperatorSpeaking} />
      </Panel>
      <Panel glow style={styles.transcriptPanel}>
        <LiveTranscription onLineComplete={handleLineComplete} isMuted={isOperatorSpeaking} />
      </Panel>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, gap: 12 },
  callPanel: { height: '46%' },
  transcriptPanel: { flex: 1 },
});
