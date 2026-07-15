import { colors as colorsLight } from "./colors"
import { colors as colorsDark } from "./colorsDark"
import { spacing as spacingLight } from "./spacing"
import { spacing as spacingDark } from "./spacingDark"
import { timing } from "./timing"
import type { Theme } from "./types"
import { typography } from "./typography"

// Here we define our themes.
export const lightTheme: Theme = {
  colors: colorsLight,
  spacing: spacingLight,
  typography,
  timing,
  isDark: false,
  assets: {
    headerLogo: require("../assets/images/bfc-app-icon.png"),
    splashLogo: require("../assets/images/bfc-splash.png"),
    qrCode: require("../assets/images/qr_code.jpg"),
    footerLogo: require("../assets/images/Astute_DFM_Logo_White.png"),
  },
}
export const darkTheme: Theme = {
  colors: colorsDark,
  spacing: spacingDark,
  typography,
  timing,
  isDark: true,
  assets: {
    headerLogo: require("../assets/images/bfc-app-icon.png"),
    splashLogo: require("../assets/images/bfc-splash.png"),
    qrCode: require("../assets/images/qr_code.jpg"),
    footerLogo: require("../assets/images/Astute_DFM_Logo_Black.png"),
  },
}
