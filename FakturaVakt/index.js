/**
 * @format
 */

// Must be at the top - before any React Native imports
// import 'react-native-gesture-handler'; // Removed temporarily

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
