import RNConfig from 'react-native-config'
import { BaseConfig } from './config.base'

const Config = {
  ...BaseConfig,
  APP_ENV: RNConfig.APP_ENV ?? 'development',
  API_URL: RNConfig.API_URL ?? '',
}

export default Config
