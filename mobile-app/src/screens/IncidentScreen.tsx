import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Panel } from '../components/ui/Panel';
import { IncidentDetails } from '../components/dashboard/IncidentDetails';
import { useIncident } from '../api/IncidentContext';

export function IncidentScreen() {
  const { incidentData, isAnalyzing, resetKey } = useIncident();

  return (
    <View style={styles.container}>
      <Panel glow style={styles.panel}>
        <IncidentDetails key={resetKey} data={incidentData} isLoading={isAnalyzing} />
      </Panel>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  panel: { flex: 1 },
});
