import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Modal,
  PanResponder,
  Pressable,
  Text,
  View,
  ViewStyle,
  TextStyle,
  LayoutChangeEvent,
} from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ContinueButton } from './ContinueButton'
import { tech } from '../../screens/TechScreens/techTheme'
import { typography } from '../../theme/typography'

export type SignaturePayload = {
  paths: string[]
  size: { width: number; height: number }
}

type Props = {
  visible: boolean
  initialPaths?: string[]
  onCancel: () => void
  onSave: (payload: SignaturePayload) => void
}

/** Parse SVG path coords to compute a bounding box for preview scaling. */
function getPathsBounds(paths: string[]) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  const re = /[ML]\s*([-\d.]+)\s+([-\d.]+)/g
  for (const d of paths) {
    let match: RegExpExecArray | null
    re.lastIndex = 0
    while ((match = re.exec(d))) {
      const x = Number(match[1])
      const y = Number(match[2])
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }
  if (!Number.isFinite(minX)) {
    return { minX: 0, minY: 0, width: 300, height: 120 }
  }
  const pad = 12
  return {
    minX: minX - pad,
    minY: minY - pad,
    width: Math.max(maxX - minX + pad * 2, 40),
    height: Math.max(maxY - minY + pad * 2, 40),
  }
}

export function SignaturePadModal({
  visible,
  initialPaths = [],
  onCancel,
  onSave,
}: Props) {
  const insets = useSafeAreaInsets()
  const [paths, setPaths] = useState<string[]>(initialPaths)
  const [currentPath, setCurrentPath] = useState('')
  const [padSize, setPadSize] = useState({ width: 320, height: 400 })
  const pathsRef = useRef(paths)
  const currentRef = useRef('')

  pathsRef.current = paths
  currentRef.current = currentPath

  useEffect(() => {
    if (!visible) return
    pathsRef.current = initialPaths
    setPaths(initialPaths)
    setCurrentPath('')
    currentRef.current = ''
    // Reset only when the modal opens — not on every parent re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const { locationX, locationY } = evt.nativeEvent
          const next = `M ${locationX.toFixed(1)} ${locationY.toFixed(1)}`
          currentRef.current = next
          setCurrentPath(next)
        },
        onPanResponderMove: (evt) => {
          const { locationX, locationY } = evt.nativeEvent
          const next = `${currentRef.current} L ${locationX.toFixed(1)} ${locationY.toFixed(1)}`
          currentRef.current = next
          setCurrentPath(next)
        },
        onPanResponderRelease: () => {
          const finished = currentRef.current
          if (finished) {
            const nextPaths = [...pathsRef.current, finished]
            pathsRef.current = nextPaths
            setPaths(nextPaths)
          }
          currentRef.current = ''
          setCurrentPath('')
        },
      }),
    [],
  )

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout
    if (width > 0 && height > 0) {
      setPadSize({ width, height })
    }
  }

  const clear = () => {
    pathsRef.current = []
    currentRef.current = ''
    setPaths([])
    setCurrentPath('')
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <View style={[$root, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}>
        <Text style={$title}>Sign visit</Text>
        <Text style={$hint}>Draw your signature below with your finger.</Text>

        <View style={$pad} onLayout={onLayout} {...panResponder.panHandlers}>
          {paths.length === 0 && !currentPath ? (
            <Text style={$padPlaceholder} pointerEvents="none">
              Sign here
            </Text>
          ) : null}
          <Svg
            width={padSize.width}
            height={padSize.height}
            style={$svg}
          >
            {paths.map((d, i) => (
              <Path
                key={`p-${i}`}
                d={d}
                stroke={tech.text}
                strokeWidth={2.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {currentPath ? (
              <Path
                d={currentPath}
                stroke={tech.text}
                strokeWidth={2.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
          </Svg>
        </View>

        <View style={$actions}>
          <Pressable onPress={clear} style={$clearBtn}>
            <Text style={$clearText}>Clear</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <ContinueButton text="Cancel" variant="secondary" onPress={onCancel} />
          </View>
          <View style={{ flex: 1 }}>
            <ContinueButton
              text="Save"
              onPress={() =>
                onSave({
                  paths,
                  size: padSize,
                })
              }
              disabled={paths.length === 0}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

type PreviewProps = {
  paths: string[]
  size?: { width: number; height: number } | null
  height?: number
}

export function SignaturePreview({ paths, size, height = 100 }: PreviewProps) {
  if (paths.length === 0) return null

  const bounds = getPathsBounds(paths)
  // Prefer path stroke bounds so a scribble in the middle of a tall pad still fills the preview.
  // Fall back to full canvas when bounds look invalid.
  const useCanvas =
    size &&
    size.width > 0 &&
    size.height > 0 &&
    bounds.width < 8

  const vbX = useCanvas ? 0 : bounds.minX
  const vbY = useCanvas ? 0 : bounds.minY
  const vbW = useCanvas ? size!.width : bounds.width
  const vbH = useCanvas ? size!.height : bounds.height

  return (
    <View style={[$previewBox, { height }]} pointerEvents="none">
      <Svg
        width="100%"
        height="100%"
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {paths.map((d, i) => (
          <Path
            key={`preview-${i}`}
            d={d}
            stroke={tech.text}
            strokeWidth={Math.max(2.5, Math.min(vbW, vbH) * 0.015)}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </Svg>
    </View>
  )
}

const $root: ViewStyle = {
  flex: 1,
  backgroundColor: tech.bg,
  paddingHorizontal: 16,
}

const $title: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 20,
  color: tech.text,
  marginBottom: 4,
}

const $hint: TextStyle = {
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: tech.textSecondary,
  marginBottom: 16,
}

const $pad: ViewStyle = {
  flex: 1,
  minHeight: 220,
  backgroundColor: tech.surface,
  borderRadius: tech.radius,
  borderWidth: 1.5,
  borderColor: tech.borderStrong,
  borderStyle: 'dashed',
  overflow: 'hidden',
  marginBottom: 16,
}

const $svg: ViewStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
}

const $padPlaceholder: TextStyle = {
  position: 'absolute',
  alignSelf: 'center',
  top: '45%',
  fontFamily: typography.primary.normal,
  fontSize: 15,
  color: tech.textMuted,
  zIndex: 1,
}

const $actions: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
}

const $clearBtn: ViewStyle = {
  paddingHorizontal: 12,
  paddingVertical: 14,
}

const $clearText: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 14,
  color: tech.danger,
}

const $previewBox: ViewStyle = {
  width: '100%',
  backgroundColor: 'transparent',
}
