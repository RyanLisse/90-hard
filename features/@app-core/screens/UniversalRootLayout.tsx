'use client';
import { PortalHost } from '@rn-primitives/portal';
import type React from 'react';
import { StyleSheet, View } from 'react-native';

// -i- This is a regular react client component
// -i- Use this file for applying your universal root layout
// -i- It will be rendered by 'apps/expo' on mobile from the 'ExpoRootLayout' component
// -i- It will also be rendered by 'apps/next' on web from the 'Document' component

/* --- Types ----------------------------------------------------------------------------------- */

type UniversalRootLayoutProps = {
  children: React.ReactNode;
};

/* --- <UniversalRootLayout/> ------------------------------------------------------------------ */

const UniversalRootLayout = ({ children }: UniversalRootLayoutProps) => (
  <View style={styles.container}>
    {children}
    <PortalHost />
  </View>
);

/* --- Styles ---------------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

/* --- Exports --------------------------------------------------------------------------------- */

export default UniversalRootLayout;
