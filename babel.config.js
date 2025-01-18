module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: './config/.env',
    }],
    'react-native-reanimated/plugin',
  ],
};
