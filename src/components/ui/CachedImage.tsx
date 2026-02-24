import { Image, type ImageProps } from 'expo-image';
import { useTheme } from '@/providers/ThemeProvider';
import { colors } from '@/styles/colors';

export function CachedImage({ style, ...props }: ImageProps) {
  const { isDark } = useTheme();

  return (
    <Image
      transition={200}
      cachePolicy="memory-disk"
      {...props}
      style={[{ backgroundColor: isDark ? colors.secondary[800] : colors.surface.DEFAULT }, style]}
    />
  );
}
