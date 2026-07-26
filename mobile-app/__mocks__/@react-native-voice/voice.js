// @react-native-voice/voice registers a real NativeEventEmitter at import time,
// which has no backing native module under Jest's jsdom-less test environment.
// This stub keeps the JS API shape so components can be unit tested without a device.
module.exports = {
  onSpeechStart: null,
  onSpeechEnd: null,
  onSpeechResults: null,
  onSpeechError: null,
  start: jest.fn(() => Promise.resolve()),
  stop: jest.fn(() => Promise.resolve()),
  destroy: jest.fn(() => Promise.resolve()),
  removeAllListeners: jest.fn(),
  isAvailable: jest.fn(() => Promise.resolve(true)),
};
