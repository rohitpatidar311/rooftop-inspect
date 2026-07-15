module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Must be listed last (Reanimated 4 delegates to this same plugin).
    'react-native-worklets/plugin',
  ],
};
