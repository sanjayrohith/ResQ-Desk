module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '^lucide-react-native$': '<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      [
        '@react-native',
        'react-native',
        '@react-navigation',
        'react-native-svg',
        'react-native-maps',
        'react-native-linear-gradient',
        'react-native-screens',
        'react-native-safe-area-context',
        '@react-native-voice/voice',
        '@react-native-community/blur',
        'lucide-react-native',
      ].join('|') +
      ')/)',
  ],
};
