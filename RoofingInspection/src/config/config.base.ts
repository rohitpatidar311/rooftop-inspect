export interface ConfigBaseProps {
  persistNavigation: 'always' | 'dev' | 'prod' | 'never'
  catchErrors: 'always' | 'dev' | 'prod' | 'never'
  exitRoutes: string[]
}

export const BaseConfig: ConfigBaseProps = {
  persistNavigation: 'dev',
  catchErrors: 'always',
  exitRoutes: ['Login', 'Dashboard'],
}
