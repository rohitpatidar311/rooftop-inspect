/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

// Native modules are stubbed for unit test smoke check of JS tree.
jest.mock('react-native-mmkv', () => {
  const store: Record<string, string> = {};
  const mmkv = {
    getString: (k: string) => store[k],
    set: (k: string, v: string) => {
      store[k] = v;
    },
    delete: (k: string) => {
      delete store[k];
    },
    clearAll: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
  };
  return {
    MMKV: jest.fn(() => mmkv),
    useMMKVString: (key: string) => [
      store[key],
      (v: string | undefined) => {
        if (v === undefined) delete store[key];
        else store[key] = v;
      },
    ],
    useMMKVObject: () => [undefined, jest.fn()],
  };
});

jest.mock('react-native-reanimated', () => {
  const Rel = require('react-native');
  return {
    __esModule: true,
    default: {
      View: Rel.View,
      Text: Rel.Text,
      Image: Rel.Image,
      createAnimatedComponent: (c: unknown) => c,
    },
    FadeIn: { duration: () => ({ delay: () => ({ springify: () => ({}) }) }) },
    FadeInDown: { duration: () => ({ delay: () => ({ springify: () => ({}) }) }) },
    useSharedValue: (v: unknown) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    withRepeat: (v: unknown) => v,
    withSequence: (...args: unknown[]) => args[0],
    withTiming: (v: unknown) => v,
  };
});

jest.mock('react-native-gesture-handler', () => {
  const Rel = require('react-native');
  return {
    GestureHandlerRootView: Rel.View,
    Swipeable: Rel.View,
    DrawerLayout: Rel.View,
    State: {},
    PanGestureHandler: Rel.View,
    BaseButton: Rel.View,
    RectButton: Rel.View,
    BorderlessButton: Rel.View,
  };
});

jest.mock('@gorhom/bottom-sheet', () => {
  const Rel = require('react-native');
  return {
    BottomSheetModal: Rel.View,
    BottomSheetModalProvider: ({ children }: { children: React.ReactNode }) => children,
    BottomSheetBackdrop: Rel.View,
    BottomSheetView: Rel.View,
    BottomSheetScrollView: Rel.ScrollView,
  };
});

jest.mock('react-native-keyboard-controller', () => {
  const Rel = require('react-native');
  return {
    KeyboardProvider: ({ children }: { children: React.ReactNode }) => children,
    KeyboardAwareScrollView: Rel.ScrollView,
  };
});

jest.mock('react-native-config', () => ({ API_URL: '', APP_ENV: 'test' }));
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');
jest.mock('@react-native-community/netinfo', () => ({
  fetch: () => Promise.resolve({ isConnected: true, isInternetReachable: true }),
  addEventListener: () => () => {},
}));
jest.mock('react-native-toast-message', () => {
  const Comp = () => null;
  Comp.show = jest.fn();
  Comp.hide = jest.fn();
  return Comp;
});
jest.mock('react-native-screens', () => {
  const Rel = require('react-native');
  return {
    enableScreens: jest.fn(),
    Screen: Rel.View,
    ScreenContainer: Rel.View,
    NativeScreen: Rel.View,
    NativeScreenContainer: Rel.View,
  };
});

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
