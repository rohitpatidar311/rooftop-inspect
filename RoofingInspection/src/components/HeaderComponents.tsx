import React from 'react'
import { Image, TouchableOpacity, View, ViewStyle, ImageStyle } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { DrawerActions, useNavigation } from '@react-navigation/native'
import { useAppTheme } from '../theme/context'
import { ThemedStyle } from '../theme/types'

export function HeaderLeft() {
  const { theme, themed } = useAppTheme()
  const navigation = useNavigation()

  return (
    <View style={themed($leftRow)}>
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={$iconBtn}
        accessibilityRole="button"
        accessibilityLabel="Open menu"
      >
        <Ionicons name="menu" size={24} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  )
}

export function HeaderTitleLogo() {
  const { theme, themed } = useAppTheme()
  return (
    <View style={$titleWrap}>
      <Image source={theme.assets.headerLogo} style={themed($logo)} resizeMode="contain" />
    </View>
  )
}

const $leftRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  marginLeft: spacing.xs,
  height: 36,
})

const $iconBtn: ViewStyle = {
  padding: 4,
}

const $titleWrap: ViewStyle = {
  alignItems: 'center',
  justifyContent: 'center',
}

const $logo: ThemedStyle<ImageStyle> = () => ({
  width: 36,
  height: 36,
})
