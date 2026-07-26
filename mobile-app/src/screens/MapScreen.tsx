import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Panel } from '../components/ui/Panel';
import { MapPanel } from '../components/dashboard/MapPanel';
import { useIncident } from '../api/IncidentContext';

export function MapScreen() {
  const { incidentData, isCritical } = useIncident();

  return (
    <View style={styles.container}>
      <Panel critical={isCritical} glow={!isCritical} style={styles.panel}>
        <MapPanel
          severity={incidentData.severity || 'Normal'}
          isDataComplete={incidentData.location !== 'Awaiting data...'}
          location={incidentData.location}
        />
      </Panel>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  panel: { flex: 1 },
});
