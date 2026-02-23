/**
 * Color tokens extracted from tailwind.config.js for use in StyleSheet and JS contexts.
 * Keep in sync with tailwind.config.js.
 */
export const colors = {
  primary: {
    DEFAULT: '#FD512E',
    50: '#FFF5F2',
    100: '#FFEBE6',
    200: '#FFD4CC',
    300: '#FFB3A3',
    400: '#FF8066',
    500: '#FD512E',
    600: '#E5401F',
    700: '#CC3318',
    800: '#A62812',
    900: '#801E0D',
  },
  surface: {
    DEFAULT: '#F6F7F9',
    50: '#FFFFFF',
    100: '#F6F7F9',
    200: '#EDEEF1',
    300: '#E4E6EA',
  },
  chip: {
    DEFAULT: '#EDEEF1',
    active: '#FFE6E0',
  },
  'dark-grey': '#111111',
  'medium-grey': '#555555',
  'light-grey': '#888888',
  divider: '#E4E6EA',
  secondary: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#2c2c2c',
    900: '#1c1c1c',
  },
  white: '#FFFFFF',
} as const;
