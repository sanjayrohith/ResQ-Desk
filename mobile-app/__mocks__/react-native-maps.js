// react-native-maps requires a native turbo module that has no stand-in under
// Jest's test environment (no real device/simulator backing it). This mock
// swaps every exported component for a plain View so screens that render a
// map can still be unit tested; it does not exercise real map behavior.
const React = require('react');
const { View } = require('react-native');

const MockComponent = (name) => {
  const Component = React.forwardRef((props, ref) =>
    React.createElement(View, { ...props, ref, testID: props.testID ?? name }),
  );
  Component.displayName = name;
  return Component;
};

const MapView = MockComponent('MapView');
MapView.Animated = MockComponent('AnimatedMapView');

module.exports = {
  __esModule: true,
  default: MapView,
  Marker: MockComponent('Marker'),
  Circle: MockComponent('Circle'),
  Polyline: MockComponent('Polyline'),
  Polygon: MockComponent('Polygon'),
  Callout: MockComponent('Callout'),
  PROVIDER_GOOGLE: 'google',
  PROVIDER_DEFAULT: 'default',
};
