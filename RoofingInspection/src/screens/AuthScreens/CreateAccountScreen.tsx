import { FC, useEffect, useRef, useState } from "react"
import {
  Image,
  ImageStyle,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text as RNText,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated"
import Icon from "react-native-vector-icons/Ionicons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Button } from "../../components/Button"
import { Text } from "../../components/Text"
import { TextField, TextFieldAccessoryProps } from "../../components/TextField"
import { AuthStackScreenProps } from "../../navigators/navigatorTypes"
import { $styles } from "../../theme/styles"
import { useAppTheme } from "../../theme/context"
import { ThemedStyle } from "../../theme/types"
import { getAppVersionDisplay } from "../../utils/appVersion"
import { showToast } from "../../utils/toast"

interface CreateAccountScreenProps extends AuthStackScreenProps<"CreateAccount"> {}

const LOGO_CONTAINER_WIDTH = 120
const LOGO_HEIGHT = 120
const INPUT_BORDER_RADIUS = 8
const ICON_SIZE = 18
const ENTER_DURATION = 400
const STAGGER_MS = 80
const ACCOUNT_CREATE_DELAY_MS = 3000

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export const CreateAccountScreen: FC<CreateAccountScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets()
  const { themed, theme } = useAppTheme()

  const usernameInputRef = useRef<TextInput>(null)
  const emailInputRef = useRef<TextInput>(null)
  const passwordInputRef = useRef<TextInput>(null)
  const confirmPasswordInputRef = useRef<TextInput>(null)

  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => setIsKeyboardVisible(true))
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setIsKeyboardVisible(false))
    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

  async function handleCreateAccount() {
    if (isSubmitting) return
    Keyboard.dismiss()

    if (!fullName.trim() || !username.trim() || !email.trim() || !password || !confirmPassword) {
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Please fill all fields.",
      })
      return
    }

    if (!validateEmail(email)) {
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Please enter a valid email address.",
      })
      return
    }

    if (password !== confirmPassword) {
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Password and confirm password must match.",
      })
      return
    }

    setIsSubmitting(true)
    await wait(ACCOUNT_CREATE_DELAY_MS)
    setIsSubmitting(false)

    showToast({
      type: "success",
      message: "Account created and will be activated in 24 hours.",
    })
    navigation.goBack()
  }

  const UserLeftAccessory = ({ style }: TextFieldAccessoryProps) => (
    <View style={style} pointerEvents="none">
      <Icon name="person-outline" size={ICON_SIZE} color={theme.colors.textDim} />
    </View>
  )

  const MailLeftAccessory = ({ style }: TextFieldAccessoryProps) => (
    <View style={style} pointerEvents="none">
      <Icon name="mail-outline" size={ICON_SIZE} color={theme.colors.textDim} />
    </View>
  )

  const LockLeftAccessory = ({ style }: TextFieldAccessoryProps) => (
    <View style={style} pointerEvents="none">
      <Icon name="lock-closed-outline" size={ICON_SIZE} color={theme.colors.textDim} />
    </View>
  )

  const PasswordRightAccessory = ({ style, editable }: TextFieldAccessoryProps) => (
    <TouchableOpacity
      style={style}
      onPress={() => editable && setShowPassword((v) => !v)}
      activeOpacity={0.7}
      disabled={!editable}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Icon
        name={showPassword ? "eye-off-outline" : "eye-outline"}
        size={ICON_SIZE}
        color={theme.colors.textDim}
      />
    </TouchableOpacity>
  )

  const ConfirmPasswordRightAccessory = ({ style, editable }: TextFieldAccessoryProps) => (
    <TouchableOpacity
      style={style}
      onPress={() => editable && setShowConfirmPassword((v) => !v)}
      activeOpacity={0.7}
      disabled={!editable}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Icon
        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
        size={ICON_SIZE}
        color={theme.colors.textDim}
      />
    </TouchableOpacity>
  )

  return (
    <View style={[$styles.flex1, themed($root)]}>
      <View style={themed($backgroundOrbOne)} pointerEvents="none" />
      <View style={themed($backgroundOrbTwo)} pointerEvents="none" />
      <Animated.View
        entering={FadeInDown.duration(ENTER_DURATION).delay(0)}
        style={[themed($backBarAbsolute), { paddingTop: insets.top + theme.spacing.sm }]}
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
                <Image style={themed($logo)} source={theme.assets.headerLogo} resizeMode="contain" />
              </View>
              <RNText style={themed($welcomeSubtitle)}>
                Create your account to get started.
              </RNText>
            </Animated.View>

            <View style={themed($loginForm)}>
              <Animated.View entering={FadeInDown.duration(ENTER_DURATION).delay(STAGGER_MS * 2)}>
                <TextField
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Full Name"
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => usernameInputRef.current?.focus()}
                  editable={!isSubmitting}
                  LeftAccessory={UserLeftAccessory}
                  containerStyle={themed($fieldBlock)}
                  inputWrapperStyle={themed($authInputWrapper)}
                  style={themed($authInputText)}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.duration(ENTER_DURATION).delay(STAGGER_MS * 3)}>
                <TextField
                  ref={usernameInputRef}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Username"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => emailInputRef.current?.focus()}
                  editable={!isSubmitting}
                  LeftAccessory={UserLeftAccessory}
                  containerStyle={themed($fieldBlock)}
                  inputWrapperStyle={themed($authInputWrapper)}
                  style={themed($authInputText)}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.duration(ENTER_DURATION).delay(STAGGER_MS * 4)}>
                <TextField
                  ref={emailInputRef}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                  editable={!isSubmitting}
                  LeftAccessory={MailLeftAccessory}
                  containerStyle={themed($fieldBlock)}
                  inputWrapperStyle={themed($authInputWrapper)}
                  style={themed($authInputText)}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.duration(ENTER_DURATION).delay(STAGGER_MS * 5)}>
                <TextField
                  ref={passwordInputRef}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                  editable={!isSubmitting}
                  LeftAccessory={LockLeftAccessory}
                  RightAccessory={PasswordRightAccessory}
                  containerStyle={themed($fieldBlock)}
                  inputWrapperStyle={themed($authInputWrapper)}
                  style={themed($authInputText)}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.duration(ENTER_DURATION).delay(STAGGER_MS * 6)}>
                <TextField
                  ref={confirmPasswordInputRef}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm Password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={!showConfirmPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleCreateAccount}
                  editable={!isSubmitting}
                  LeftAccessory={LockLeftAccessory}
                  RightAccessory={ConfirmPasswordRightAccessory}
                  containerStyle={themed($fieldBlock)}
                  inputWrapperStyle={themed($authInputWrapper)}
                  style={themed($authInputText)}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.duration(ENTER_DURATION).delay(STAGGER_MS * 7)}>
                <Button
                  text="Create Account"
                  loading={isSubmitting}
                  onPress={handleCreateAccount}
                  disabled={isSubmitting}
                  style={themed($createButton)}
                  textStyle={themed($createButtonText)}
                />
              </Animated.View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {!isKeyboardVisible && (
        <Animated.View
          entering={FadeIn.duration(ENTER_DURATION).delay(STAGGER_MS * 8)}
          style={themed($footerContainer)}
        >
          <RNText style={themed($footerText)}>© 2026 Roofing Inspection. All rights reserved.</RNText>
          <RNText style={themed($footerText)}>{getAppVersionDisplay()}</RNText>
        </Animated.View>
      )}
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

const $createButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 42,
  borderRadius: INPUT_BORDER_RADIUS,
  marginTop: spacing.xs,
  paddingVertical: spacing.xs,
})

const $createButtonText: ThemedStyle<TextStyle> = () => ({
  fontSize: 14,
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
