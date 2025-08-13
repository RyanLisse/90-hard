import type { KnownRoutes } from '@app/registries/routeManifest.generated';
import { Link as ExpoLink } from 'expo-router';
import { parseNativewindStyles } from '../styles/parseNativewindStyles';
import type { UniversalLinkProps } from './Link.types';

/* --- <Link/> --------------------------------------------------------------------------------- */

export const Link = <HREF extends KnownRoutes>(
  props: UniversalLinkProps<HREF>
) => {
  // Props
  const {
    children,
    href,
    params = {},
    style,
    className,
    replace,
    onPress,
    target,
    asChild,
    push,
    testID,
    allowFontScaling,
    numberOfLines,
    maxFontSizeMultiplier,
    suppressHighlighting = true,
  } = props;

  // Vars
  const nativeID = props.id || props.nativeID;

  // -- Inject params? --

  const finalHref = Object.keys(params).reduce((acc, key) => {
    // Inject into [param] in href?
    const isRouteParam = acc.includes(`[${key}]`);
    if (isRouteParam) {
      return acc.replace(`[${key}]`, params[key]);
    }
    // Inject as query param instead?
    return `${acc}${acc.includes('?') ? '&' : '?'}${key}=${params[key]}`;
  }, href);

  // -- Nativewind --

  const { nativeWindStyles, restStyle } = parseNativewindStyles(style);
  const finalStyle = { ...nativeWindStyles, ...restStyle };

  // -- Render --

  return (
    <ExpoLink
      allowFontScaling={allowFontScaling}
      asChild={asChild}
      className={className}
      href={finalHref}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      nativeID={nativeID}
      numberOfLines={numberOfLines}
      onPress={onPress}
      push={push}
      replace={replace}
      style={finalStyle}
      suppressHighlighting={suppressHighlighting}
      target={target}
      testID={testID}
    >
      {children}
    </ExpoLink>
  );
};
