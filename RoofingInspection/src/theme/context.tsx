import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react"
import { StyleProp, useColorScheme } from "react-native"
import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavDefaultTheme,
  Theme as NavTheme,
} from "@react-navigation/native"
import { useMMKVString } from "react-native-mmkv"

import { setImperativeTheming } from "./context.utils"
import { darkTheme, lightTheme } from "./theme"
import {
  ACCENT_COLORS,
  type AccentColorName,
  type AllowedStylesT,
  type ImmutableThemeContextModeT,
  type Theme,
  type ThemeContextModeT,
  type ThemedFnT,
  type ThemedStyle,
} from "./types"
import { storage } from "../utils/storage"

export type ThemeContextType = {
  navigationTheme: NavTheme
  setThemeContextOverride: (newTheme: ThemeContextModeT) => void
  theme: Theme
  themeContext: ImmutableThemeContextModeT
  /** User preference: "light" | "dark" | "auto" (auto = follow system) */
  themePreference: ThemeContextModeT
  themed: ThemedFnT
  accentColor: AccentColorName
  setAccentColor: (color: AccentColorName) => void
}

export const ThemeContext = createContext<ThemeContextType | null>(null)

export interface ThemeProviderProps {
  initialContext?: ThemeContextModeT
}

export const ThemeProvider: FC<PropsWithChildren<ThemeProviderProps>> = ({
  children,
  initialContext,
}) => {
  const systemColorScheme = useColorScheme()
  const [themeScheme, setThemeScheme] = useMMKVString("ignite.themeScheme", storage)
  const [accentColorStr, setAccentColorInternal] = useMMKVString("ignite.accentColor", storage)
  
  const currentAccentColor = (accentColorStr as AccentColorName) || "Blue"

  const setAccentColor = useCallback((color: AccentColorName) => setAccentColorInternal(color), [setAccentColorInternal])

  const setThemeContextOverride = useCallback(
    (newTheme: ThemeContextModeT) => {
      setThemeScheme(newTheme)
    },
    [setThemeScheme],
  )

  const themePreference: ThemeContextModeT = useMemo(
    () => (initialContext ?? (themeScheme === "light" || themeScheme === "dark" ? themeScheme : "auto")),
    [initialContext, themeScheme],
  )

  const themeContext: ImmutableThemeContextModeT = useMemo(() => {
    const effective =
      initialContext ??
      (themeScheme === "auto" || !themeScheme ? (systemColorScheme === "dark" ? "dark" : "light") : themeScheme)
    return effective === "dark" ? "dark" : "light"
  }, [initialContext, themeScheme, systemColorScheme])

  const theme: Theme = useMemo(() => {
    const baseTheme = themeContext === "dark" ? darkTheme : lightTheme
    const selectedAccentHex = ACCENT_COLORS[currentAccentColor] as string

    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        tint: selectedAccentHex,
      } as Theme["colors"],
    }
  }, [themeContext, currentAccentColor])

  const navigationTheme: NavTheme = useMemo(() => {
    const navBase = themeContext === "dark" ? NavDarkTheme : NavDefaultTheme
    return { ...navBase, colors: { ...navBase.colors, primary: theme.colors.tint } }
  }, [themeContext, theme.colors.tint])

  useEffect(() => {
    setImperativeTheming(theme)
  }, [theme])

  const themed = useCallback(
    <T,>(styleOrStyleFn: AllowedStylesT<T>) => {
      const flatStyles = [styleOrStyleFn].flat(3) as (ThemedStyle<T> | StyleProp<T>)[]
      const stylesArray = flatStyles.map((f) => {
        if (typeof f === "function") {
          return (f as ThemedStyle<T>)(theme)
        } else {
          return f
        }
      })
      return Object.assign({}, ...stylesArray) as T
    },
    [theme],
  )

  // Minimal Change: Memoize this value object for RN 0.83 performance
  const value = useMemo(() => ({
    navigationTheme,
    theme,
    themeContext,
    themePreference,
    setThemeContextOverride,
    themed,
    accentColor: currentAccentColor,
    setAccentColor,
  }), [navigationTheme, theme, themeContext, themePreference, themed, currentAccentColor, setAccentColor, setThemeContextOverride])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useAppTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useAppTheme must be used within an ThemeProvider")
  }
  return context
}