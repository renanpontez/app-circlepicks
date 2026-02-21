import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

const logoSource = require('../../assets/splash-icon.png');

interface LogoProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export function Logo({ size = 32, style }: LogoProps) {
  return (
    <Image
      source={logoSource}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}
