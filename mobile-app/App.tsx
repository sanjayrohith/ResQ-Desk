import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { colors } from './src/theme';
import { IncidentProvider } from './src/api/IncidentContext';
import { RootTabs } from './src/navigation/RootTabs';

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.card,
    border: colors.slate[700],
    primary: colors.cyan[400],
    text: colors.foreground,
  },
};

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        <IncidentProvider>
          <NavigationContainer theme={navTheme}>
            <RootTabs />
          </NavigationContainer>
        </IncidentProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default App;
