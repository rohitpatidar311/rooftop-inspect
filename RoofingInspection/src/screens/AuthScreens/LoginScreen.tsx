import { FC, useEffect, useRef, useState } from "react"
import {
  Image,
  ImageStyle,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
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

import { TextField, TextFieldAccessoryProps } from "../../components/TextField"
import { AuthStackScreenProps } from "../../navigators/navigatorTypes"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { useAuth } from "../../context/AuthContext"
import { useAppTheme } from "../../theme/context"
import { clearAuthError, loginUser } from "../../redux/slices/authSlice"
import { showToast } from "../../utils/toast"
import { Button } from "../../components/Button"
import { ThemedStyle } from "../../theme/types"
import { loadString, saveString } from "../../utils/storage"
import { getAppVersionDisplay } from "../../utils/appVersion"
import { $styles } from "../../theme/styles"

interface LoginScreenProps extends AuthStackScreenProps<"Login"> {}

/** Compact auth layout — shared visual scale with ForgotPassword */
const LOGO_CONTAINER_WIDTH = 120
const LOGO_HEIGHT = 120
const INPUT_BORDER_RADIUS = 8
const ICON_SIZE = 18

const ENTER_DURATION = 400
const STAGGER_MS = 80
const LAST_USERNAME_KEY = "lastUsername"

export const LoginScreen: FC<LoginScreenProps> = (_props) => {
  const dispatch = useAppDispatch()
  const { status } = useAppSelector((state) => state.auth)
  const { navigation } = _props

  const passwordInputRef = useRef<TextInput>(null)

  const [userName, setUserName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const { setAuthEmail, setUserData, setAuthToken } = useAuth()

  const isLoading = status === "loading"

  const { themed, theme } = useAppTheme()

  useEffect(() => {
    const savedUserName = loadString(LAST_USERNAME_KEY)
    if (savedUserName) {
      setUserName(savedUserName)
      setPassword("Welcome@2024")
    }

    const showSub = Keyboard.addListener("keyboardDidShow", () => setIsKeyboardVisible(true))
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setIsKeyboardVisible(false))

    return () => {
      dispatch(clearAuthError())
      showSub.remove()
      hideSub.remove()
    }
  }, [dispatch])

  async function login() {
    Keyboard.dismiss()
    if (isLoading) return
    if (userName.length === 0 || password.length === 0) {
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Username and password are required.",
      })
      return
    }
    try {
      const result = await dispatch(
        loginUser({ UserName: userName, plainTextPassword: password }),
      ).unwrap()
      saveString(LAST_USERNAME_KEY, userName)
      setPassword("")
      setAuthEmail(result.user.Email)
      setAuthToken(result.token)
      setUserData(result.user)
      showToast({
        type: "success",
        message: "Logged in successfully.",
      })
    } catch (err: any) {
      Keyboard.dismiss()
      showToast({
        type: "error",
        title: "Login Failed",
        message: (err && err.message) || String(err) || "Unknown error",
      })
      console.error("Login failed:", err)
    }
  }

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

  return (
    <View style={[$styles.flex1, themed($root)]}>
      <View style={themed($backgroundOrbOne)} pointerEvents="none" />
      <View style={themed($backgroundOrbTwo)} pointerEvents="none" />
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
                entering={FadeInDown.duration(ENTER_DURATION).delay(0)}
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
                  Sign in to access your account.
                </RNText>
              </Animated.View>

              <View style={themed($loginForm)}>
                <Animated.View
                  entering={FadeInDown.duration(ENTER_DURATION).delay(STAGGER_MS)}
                >
                  <TextField
                    value={userName}
                    onChangeText={setUserName}
                    placeholder="Username"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                    editable={!isLoading}
                    LeftAccessory={MailLeftAccessory}
                    containerStyle={themed($fieldBlock)}
                    inputWrapperStyle={themed($authInputWrapper)}
                    style={themed($authInputText)}
                  />
                </Animated.View>

                <Animated.View
                  entering={FadeInDown.duration(ENTER_DURATION).delay(STAGGER_MS * 2)}
                >
                  <TextField
                    ref={passwordInputRef}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={!showPassword}
                    returnKeyType="go"
                    onSubmitEditing={login}
                    editable={!isLoading}
                    LeftAccessory={LockLeftAccessory}
                    RightAccessory={PasswordRightAccessory}
                    containerStyle={themed($fieldBlock)}
                    inputWrapperStyle={themed($authInputWrapper)}
                    style={themed($authInputText)}
                  />
                </Animated.View>

                <Animated.View
                  entering={FadeInDown.duration(ENTER_DURATION).delay(STAGGER_MS * 3)}
                  style={themed($formOptions)}
                >
                  <TouchableOpacity
                    onPress={() => navigation.navigate("ForgotPassword")}
                    activeOpacity={0.7}
                  >
                    <RNText style={themed($forgotPasswordText)}>Forgot Password</RNText>
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View
                  entering={FadeInDown.duration(ENTER_DURATION).delay(STAGGER_MS * 4)}
                >
                  <Button
                    testID="login-button"
                    text="Sign In"
                    loading={isLoading}
                    style={themed($loginButton)}
                    textStyle={themed($loginButtonText)}
                    onPress={login}
                    disabled={isLoading}
                  />
                </Animated.View>
                <Animated.View
                  entering={FadeInDown.duration(ENTER_DURATION).delay(STAGGER_MS * 5)}
                >
                  <Button
                    text="Create Account"
                    preset="outline"
                    style={themed($createAccountButton)}
                    textStyle={themed($createAccountButtonText)}
                    onPress={() => navigation.navigate("CreateAccount")}
                    disabled={isLoading}
                  />
                </Animated.View>
              </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {!isKeyboardVisible && (
        <Animated.View
          entering={FadeIn.duration(ENTER_DURATION).delay(STAGGER_MS * 5)}
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
  opacity: 0.1,
})

const $backgroundOrbTwo: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  width: 180,
  height: 180,
  borderRadius: 90,
  bottom: 60,
  left: -80,
  backgroundColor: colors.tint,
  opacity: 0.1,
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
  marginBottom: 36,
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

const $formOptions: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "flex-end",
  marginTop: 4,
  marginBottom: 0,
})

const $forgotPasswordText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 13,
  color: colors.tint,
  paddingVertical: 4,
  paddingHorizontal: 4,
  fontFamily: typography.primary.normal,
})

const $loginButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 42,
  borderRadius: INPUT_BORDER_RADIUS,
  marginTop: spacing.xs,
  paddingVertical: spacing.xs,
})

const $loginButtonText: ThemedStyle<TextStyle> = () => ({
  fontSize: 14,
})

const $createAccountButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 42,
  borderRadius: INPUT_BORDER_RADIUS,
  marginTop: spacing.xs,
  paddingVertical: spacing.xs,
})

const $createAccountButtonText: ThemedStyle<TextStyle> = () => ({
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
