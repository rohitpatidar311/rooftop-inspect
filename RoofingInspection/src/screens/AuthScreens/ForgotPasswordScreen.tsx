import { FC, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Image,
  ImageStyle,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text as RNText,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated"
import Icon from "react-native-vector-icons/Ionicons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { AuthStackScreenProps } from "../../navigators/navigatorTypes"
import { Button } from "../../components/Button"
import { TextField, TextFieldAccessoryProps } from "../../components/TextField"
import { AppBottomSheet, AppBottomSheetRef } from "../../components/AppBottomSheet"
import { Text } from "../../components/Text"
import { useAppTheme } from "../../theme/context"
import { ThemedStyle } from "../../theme/types"
import { api } from "../../services/api"
import { showToast } from "../../utils/toast"
import { getAppVersionDisplay } from "../../utils/appVersion"
import { $styles } from "../../theme/styles"

interface ForgotPasswordScreenProps extends AuthStackScreenProps<"ForgotPassword"> {}

const LOGO_CONTAINER_WIDTH = 120
const LOGO_HEIGHT = 120
const INPUT_BORDER_RADIUS = 8
const ICON_SIZE = 18

const ENTER_DURATION = 400
const STAGGER_MS = 80

export const ForgotPasswordScreen: FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets()
  const { themed, theme } = useAppTheme()
  const questionSheetRef = useRef<AppBottomSheetRef>(null)

  const [username, setUsername] = useState<string>("")
  const [securityQuestions, setSecurityQuestions] = useState<{ Value: number; Text: string }[]>([])
  const [securityQuestionId, setSecurityQuestionId] = useState<number>(0)
  const [securityQuestionLoading, setSecurityQuestionLoading] = useState<boolean>(false)
  const [securityAnswer, setSecurityAnswer] = useState<string>("")
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

  useEffect(() => {
    let isMounted = true
    const loadQuestions = async () => {
      setSecurityQuestionLoading(true)
      const result = await api.getSecretQuestionList()
      if (!isMounted) return
      setSecurityQuestionLoading(false)
      if (result.kind === "ok") {
        setSecurityQuestions(result.data)
      } else {
        showToast({
          type: "error",
          title: "Error",
          message: result.kind === "rejected" ? result.message : "Could not load security questions.",
        })
      }
    }
    loadQuestions()

    const showSub = Keyboard.addListener("keyboardDidShow", () => setIsKeyboardVisible(true))
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setIsKeyboardVisible(false))

    return () => {
      isMounted = false
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  const selectedQuestionText =
    securityQuestionId && securityQuestions.find((q) => q.Value === securityQuestionId)?.Text

  async function handleSubmit() {
    if (!username.trim()) {
      showToast({
        type: "error",
        title: "Validation",
        message: "Please enter your username.",
      })
      return
    }
    if (!securityQuestionId) {
      showToast({
        type: "error",
        title: "Validation",
        message: "Please select a security question.",
      })
      return
    }
    if (!securityAnswer.trim()) {
      showToast({
        type: "error",
        title: "Validation",
        message: "Please enter your security answer.",
      })
      return
    }

    Keyboard.dismiss()
    setSubmitLoading(true)
    const result = await api.forgotPassword({
      Username: username.trim(),
      SecurityQuestionId: securityQuestionId,
      SecurityAnswerPlain: securityAnswer.trim(),
    })
    setSubmitLoading(false)

    if (result.kind === "ok") {
      showToast({
        type: "success",
        message: result.message,
      })
      navigation.goBack()
    } else {
      showToast({
        type: "error",
        title: "Forgot Password",
        message: result.kind === "rejected" ? result.message : "Request failed. Try again.",
      })
    }
  }

  const MailLeftAccessory = ({ style }: TextFieldAccessoryProps) => (
    <View style={style} pointerEvents="none">
      <Icon name="mail-outline" size={ICON_SIZE} color={theme.colors.textDim} />
    </View>
  )

  const AnswerLeftAccessory = ({ style }: TextFieldAccessoryProps) => (
    <View style={style} pointerEvents="none">
      <Icon name="key-outline" size={ICON_SIZE} color={theme.colors.textDim} />
    </View>
  )

  return (
    <View style={[$styles.flex1, themed($root)]}>
      <View style={themed($backgroundOrbOne)} pointerEvents="none" />
      <View style={themed($backgroundOrbTwo)} pointerEvents="none" />
      <Animated.View
        entering={FadeInDown.duration(ENTER_DURATION).delay(0)}
        style={[
          themed($backBarAbsolute),
          { paddingTop: insets.top + theme.spacing.sm },
        ]}
      >
        <View style={themed($topBar)}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [themed($backButton), pressed && { opacity: 0.7 }]}
          >
            <Icon name="chevron-back" size={24} color={theme.colors.text} />
            <Text text="Back" size="sm" style={themed($backText)} />
          </Pressable>
        </View>
      </Animated.View>

      <KeyboardAvoidingView
        style={$styles.flex1}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={themed($scrollContent)}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={themed($authContainer)}>
            <Animated.View
              entering={FadeInDown.duration(ENTER_DURATION).delay(STAGGER_MS)}
              style={themed($loginHeader)}
            >
              <View style={themed($iconContainer)}>
                <Image
                  style={themed($logo)}
                  source={theme.assets.headerLogo}
                  resizeMode="contain"
                />
              </View>
              <RNText style={themed($welcomeSubtitle)}>
                Confirm your identity with your security question to reset access.
              </RNText>
            </Animated.View>

            <View style={themed($loginForm)}>
              <Animated.View
                entering={FadeInDown.duration(ENTER_DURATION).delay(STAGGER_MS * 2)}
              >
                <TextField
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Username"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  editable={!submitLoading}
                  LeftAccessory={MailLeftAccessory}
                  containerStyle={themed($fieldBlock)}
                  inputWrapperStyle={themed($authInputWrapper)}
                  style={themed($authInputText)}
                />
              </Animated.View>

              <Animated.View
                entering={FadeInDown.duration(ENTER_DURATION).delay(STAGGER_MS * 3)}
                style={themed($fieldBlock)}
              >
                <Pressable
                  onPress={() => {
                    Keyboard.dismiss()
                    if (securityQuestions.length === 0 && !securityQuestionLoading) {
                      showToast({
                        type: "error",
                        title: "Error",
                        message: "Security questions not loaded yet.",
                      })
                      return
                    }
                    questionSheetRef.current?.present()
                  }}
                  disabled={submitLoading}
                  style={({ pressed }) => [
                    themed($selectorTouchable),
                    pressed && { opacity: 0.85 },
                    submitLoading && { opacity: 0.6 },
                  ]}
                >
                  <Icon
                    name="help-circle-outline"
                    size={ICON_SIZE}
                    color={theme.colors.textDim}
                    style={{ marginRight: theme.spacing.xs }}
                  />
                  <Text
                    text={
                      selectedQuestionText && selectedQuestionText.length > 0
                        ? selectedQuestionText
                        : "Select security question"
                    }
                    size="sm"
                    style={{
                      flex: 1,
                      color: selectedQuestionText ? theme.colors.text : theme.colors.textDim,
                      fontSize: 14,
                    }}
                    numberOfLines={2}
                  />
                  <Icon name="chevron-down" size={18} color={theme.colors.textDim} />
                </Pressable>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.duration(ENTER_DURATION).delay(STAGGER_MS * 4)}
              >
                <TextField
                  value={securityAnswer}
                  onChangeText={setSecurityAnswer}
                  placeholder="Security answer"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!submitLoading}
                  LeftAccessory={AnswerLeftAccessory}
                  containerStyle={themed($fieldBlock)}
                  inputWrapperStyle={themed($authInputWrapper)}
                  style={themed($authInputText)}
                />
              </Animated.View>

              <Animated.View
                entering={FadeInDown.duration(ENTER_DURATION).delay(STAGGER_MS * 5)}
              >
                <Button
                  text="Submit"
                  loading={submitLoading}
                  onPress={handleSubmit}
                  disabled={submitLoading}
                  style={themed($submitButton)}
                  textStyle={themed($submitButtonText)}
                />
              </Animated.View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {!isKeyboardVisible && (
        <Animated.View
          entering={FadeIn.duration(ENTER_DURATION).delay(STAGGER_MS * 6)}
          style={themed($footerContainer)}
        >
          <RNText style={themed($footerText)}>© 2026 Roofing Inspection. All rights reserved.</RNText>
          <RNText style={themed($footerText)}>{getAppVersionDisplay()}</RNText>
        </Animated.View>
      )}

      <AppBottomSheet
        ref={questionSheetRef}
        title="Select security question"
        snapPoints={["55%"]}
      >
        {securityQuestionLoading ? (
          <View style={themed($sheetLoading)}>
            <ActivityIndicator size="small" color={theme.colors.tint} />
          </View>
        ) : (
          <ScrollView style={themed($sheetScroll)} showsVerticalScrollIndicator={false}>
            {securityQuestions.map((q) => (
              <Pressable
                key={q.Value}
                onPress={() => {
                  setSecurityQuestionId(q.Value)
                  questionSheetRef.current?.dismiss()
                }}
                style={({ pressed }) => [themed($sheetItem), pressed && { opacity: 0.7 }]}
              >
                <Text
                  text={q.Text}
                  size="sm"
                  weight="500"
                  style={{ color: theme.colors.text, flex: 1 }}
                  numberOfLines={2}
                />
                {securityQuestionId === q.Value ? (
                  <Icon
                    name="checkmark-circle"
                    size={22}
                    color={theme.colors.tint}
                    style={{ marginLeft: theme.spacing.sm }}
                  />
                ) : null}
              </Pressable>
            ))}
          </ScrollView>
        )}
      </AppBottomSheet>
    </View>
  )
}

const $root: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.loginPageBg,
})

const $backgroundOrbOne: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  width: 220,
  height: 220,
  borderRadius: 110,
  top: -70,
  right: -80,
  backgroundColor: colors.tint,
  opacity: 0.08,
})

const $backgroundOrbTwo: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  width: 180,
  height: 180,
  borderRadius: 90,
  bottom: 60,
  left: -80,
  backgroundColor: colors.tint,
  opacity: 0.06,
})

const $scrollContent: ThemedStyle<ViewStyle> = () => ({
  flexGrow: 1,
  paddingHorizontal: 20,
  justifyContent: "center",
  paddingBottom: 80,
})

const $authContainer: ThemedStyle<ViewStyle> = () => ({
  maxWidth: 400,
  width: "100%",
  alignSelf: "center",
  paddingVertical: 48,
})

const $backBarAbsolute: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 10,
  paddingHorizontal: 20,
})

const $topBar: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingBottom: spacing.xs,
})

const $backButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.xs,
  marginLeft: -spacing.xs,
})

const $backText: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  marginLeft: spacing.xs,
  color: colors.text,
  fontFamily: typography.primary.normal,
})

const $loginHeader: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  marginBottom: 28,
})

const $iconContainer: ThemedStyle<ViewStyle> = () => ({
  width: LOGO_CONTAINER_WIDTH,
  marginBottom: 20,
  overflow: "hidden",
  alignItems: "center",
  justifyContent: "center",
})

const $logo: ThemedStyle<ImageStyle> = () => ({
  width: "100%",
  height: LOGO_HEIGHT,
})

const $welcomeSubtitle: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 15,
  color: colors.textDim,
  lineHeight: 20,
  margin: 0,
  textAlign: "center",
  fontFamily: typography.primary.normal,
})

const $loginForm: ThemedStyle<ViewStyle> = () => ({
  gap: 6,
})

const $fieldBlock: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
})

const $authInputWrapper: ThemedStyle<ViewStyle> = () => ({
  borderRadius: INPUT_BORDER_RADIUS,
  minHeight: 42,
  alignItems: "center",
})

const $authInputText: ThemedStyle<TextStyle> = () => ({
  fontSize: 14,
  marginVertical: 10,
})

const $selectorTouchable: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 42,
  paddingHorizontal: spacing.sm,
  paddingVertical: 10,
  borderRadius: INPUT_BORDER_RADIUS,
  borderWidth: 1,
  borderColor: colors.palette.neutral400,
  backgroundColor: colors.palette.inputColor,
  flexDirection: "row",
  alignItems: "center",
})

const $submitButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 42,
  borderRadius: INPUT_BORDER_RADIUS,
  marginTop: spacing.xs,
  paddingVertical: spacing.xs,
})

const $submitButtonText: ThemedStyle<TextStyle> = () => ({
  fontSize: 14,
})

const $sheetLoading: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.lg,
  alignItems: "center",
  justifyContent: "center",
})

const $sheetScroll: ThemedStyle<ViewStyle> = () => ({
  maxHeight: 320,
})

const $sheetItem: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
})

const $footerContainer: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  alignItems: "center",
  paddingTop: 12,
  paddingBottom: 24,
})

const $footerText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12.8,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  fontWeight: "700",
  textAlign: "center",
  lineHeight: 20,
})
