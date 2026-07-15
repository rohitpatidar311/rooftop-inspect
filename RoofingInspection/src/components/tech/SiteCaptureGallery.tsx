import React from 'react'
import {
  Image,
  ImageStyle,
  Pressable,
  Text,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import type { SitePhoto } from '../../services/api/types'
import { tech, $techCard } from '../../screens/TechScreens/techTheme'
import { typography } from '../../theme/typography'

type Props = {
  photos: SitePhoto[]
  title?: string
  emptyText?: string
  readOnly?: boolean
  onRemove?: (photoId: string) => void
}

export function SiteCaptureGallery({
  photos,
  title = 'Captured Photos',
  emptyText,
  readOnly = false,
  onRemove,
}: Props) {
  if (photos.length === 0) {
    if (!emptyText) return null
    return (
      <View style={$emptyBox}>
        <Ionicons name="images-outline" size={28} color={tech.textMuted} />
        <Text style={$emptyText}>{emptyText}</Text>
      </View>
    )
  }

  return (
    <View style={$gallery}>
      <Text style={$galleryTitle}>{title}</Text>
      {photos.map((photo, index) => (
        <View key={photo.id} style={[$techCard, $photoCard]}>
          {photo.uri ? (
            <Image source={{ uri: photo.uri }} style={$thumbImage} />
          ) : (
            <View style={$thumb}>
              <Ionicons name="image-outline" size={28} color={tech.textMuted} />
            </View>
          )}
          <View style={$photoMeta}>
            <Text style={$captionTitle}>
              Caption · #{photos.length - index}
            </Text>
            <Text style={$captionValue}>{photo.caption}</Text>
          </View>
          {!readOnly && onRemove ? (
            <Pressable
              onPress={() => onRemove(photo.id)}
              hitSlop={8}
              accessibilityLabel="Remove photo"
            >
              <Ionicons name="trash-outline" size={18} color={tech.danger} />
            </Pressable>
          ) : null}
        </View>
      ))}
    </View>
  )
}

const $gallery: ViewStyle = {
  marginTop: 16,
  marginBottom: 16,
  gap: 10,
}

const $galleryTitle: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 15,
  color: tech.text,
  marginBottom: 2,
}

const $photoCard: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  marginBottom: 0,
  padding: 12,
}

const $thumb: ViewStyle = {
  width: 64,
  height: 64,
  borderRadius: 10,
  backgroundColor: tech.bg,
  alignItems: 'center',
  justifyContent: 'center',
}

const $thumbImage: ImageStyle = {
  width: 64,
  height: 64,
  borderRadius: 10,
  backgroundColor: tech.bg,
}

const $photoMeta: ViewStyle = {
  flex: 1,
}

const $captionTitle: TextStyle = {
  fontFamily: typography.primary.normal,
  fontSize: 11,
  color: tech.textMuted,
  marginBottom: 2,
  textTransform: 'uppercase',
  letterSpacing: 0.3,
}

const $captionValue: TextStyle = {
  fontFamily: typography.primary.semiBold,
  fontSize: 14,
  color: tech.text,
  lineHeight: 19,
}

const $emptyBox: ViewStyle = {
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 20,
  marginBottom: 16,
  gap: 8,
  backgroundColor: tech.surface,
  borderRadius: tech.radiusSm,
  borderWidth: 1,
  borderColor: tech.border,
}

const $emptyText: TextStyle = {
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: tech.textSecondary,
  textAlign: 'center',
  paddingHorizontal: 16,
}
