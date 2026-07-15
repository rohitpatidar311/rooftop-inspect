import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { BackHandler, Keyboard, Platform, View, ViewStyle, TextStyle, StyleSheet } from "react-native"
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet"
import type { BottomSheetModalProps } from "@gorhom/bottom-sheet"
import { Text } from "./Text"
import { useAppTheme } from "../theme/context"
import { ThemedStyle } from "../theme/types"

export interface AppBottomSheetProps {
  title?: string
  children: React.ReactNode
  snapPoints?: string[]
  onDismiss?: () => void
  /** Enable keyboard handling so inputs stay above keyboard. Use with BottomSheetTextInput inside. */
  keyboardBehavior?: BottomSheetModalProps["keyboardBehavior"]
  keyboardBlurBehavior?: BottomSheetModalProps["keyboardBlurBehavior"]
  android_keyboardInputMode?: BottomSheetModalProps["android_keyboardInputMode"]
}

export type AppBottomSheetRef = BottomSheetModal

export const AppBottomSheet = forwardRef<BottomSheetModal, AppBottomSheetProps>(
  (props, ref) => {
    const { title, children, snapPoints = ["35%"], onDismiss, keyboardBehavior, keyboardBlurBehavior, android_keyboardInputMode } = props
    const { theme, themed } = useAppTheme()
    const bottomSheetRef = useRef<BottomSheetModal>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    const handleSheetChange = useCallback((index: number) => {
      setIsSheetOpen(index >= 0)
    }, [])

    const handleSheetDismiss = useCallback(() => {
      setIsSheetOpen(false)
      onDismiss?.()
    }, [onDismiss])

    useEffect(() => {
      if (!isSheetOpen || Platform.OS !== "android") return

      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        bottomSheetRef.current?.dismiss()
        return true
      })

      return () => subscription.remove()
    }, [isSheetOpen])

    useImperativeHandle(
      ref,
      () =>
        new Proxy({} as BottomSheetModal, {
          get(_target, prop: string | symbol) {
            const sheet = bottomSheetRef.current
            if (prop === "present") {
              return () => {
                Keyboard.dismiss()
                sheet?.present()
              }
            }
            if (!sheet) return undefined
            const value = (sheet as unknown as Record<string | symbol, unknown>)[prop]
            return typeof value === "function" ? value.bind(sheet) : value
          },
        }),
      [],
    )

    const memoSnapPoints = useMemo(() => snapPoints, [snapPoints])

    const renderBackdrop = useCallback(
      (backdropProps: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...backdropProps}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.5}
        />
      ),
      [],
    )

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={memoSnapPoints}
        onChange={handleSheetChange}
        onDismiss={handleSheetDismiss}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: theme.colors.tint }}
        backgroundStyle={{ backgroundColor: theme.colors.palette.cardColor }}
        keyboardBehavior={keyboardBehavior}
        keyboardBlurBehavior={keyboardBlurBehavior}
        android_keyboardInputMode={android_keyboardInputMode}
      >
        <BottomSheetView style={themed($container)}>
          {title && (
            <View style={themed($header)}>
              <Text
                preset="default"
                weight="semiBold"
                style={themed($headerTitle)}
                text={title}
              />
            </View>
          )}
          <View style={themed($content)}>
            {children}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    )
  },
)

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.lg,
  flex: 1,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderBottomColor: colors.separator,
})

const $headerTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 18,
  color: colors.text,
})

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: spacing.md,
  paddingBottom: spacing.sm,
})