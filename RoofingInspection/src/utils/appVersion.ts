/**
 * App version helpers without react-native-device-info.
 */
export function getAppVersion(): string {
  return '1.0.0'
}

export function getAppBuildNumber(): string {
  return '1'
}

export function getAppVersionDisplay(): string {
  return `Version ${getAppVersion()}`
}
