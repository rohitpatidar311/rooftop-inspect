import { Platform } from "react-native"

export const customFontsToLoad = {
  UbuntuLight: require("../assets/fonts/Ubuntu-Light.ttf"),
  UbuntuRegular: require("../assets/fonts/Ubuntu-Regular.ttf"),
  UbuntuMedium: require("../assets/fonts/Ubuntu-Medium.ttf"),
  UbuntuBold: require("../assets/fonts/Ubuntu-Bold.ttf"),
}

/**
 * Android uses the font filename (without extension) as fontFamily.
 * iOS uses the font's internal display name from the TTF metadata.
 */
const ubuntuFontNames = Platform.select({
  android: {
    thin: "Ubuntu-Light",
    light: "Ubuntu-Light",
    normal: "Ubuntu-Regular",
    semiBold: "Ubuntu-Medium",
    bold: "Ubuntu-Bold",
  },
  default: {
    thin: "Ubuntu",
    light: "Ubuntu",
    normal: "Ubuntu",
    semiBold: "Ubuntu",
    bold: "Ubuntu",
  },
})

const fonts = {
  ubuntu: ubuntuFontNames,
}

export const typography = {
  /**
   * The fonts are available to use, but prefer using the semantic name.
   */
  fonts,
  /**
   * The primary font. Used in most places.
   */
  primary: fonts.ubuntu,
  /**
   * An alternate font used for perhaps titles and stuff.
   */
  secondary: fonts.ubuntu,
  /**
   * Lets get fancy with a monospace font!
   */
  code: fonts.ubuntu,
}