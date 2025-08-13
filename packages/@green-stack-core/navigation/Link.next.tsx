import type { KnownRoutes } from '@app/registries/routeManifest.generated';
import NextLink from 'next/link';
import type { ComponentProps } from 'react';
import { parseNativewindStyles } from '../styles/parseNativewindStyles';
import { cn } from '../utils/styleUtils';
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
    className,
    style,
    replace,
    onPress,
    target,
    scroll,
    shallow,
    passHref,
    prefetch,
    locale,
    as,
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

  const { nativeWindStyles, nativeWindClassName, restStyle } =
    parseNativewindStyles(style);
  const finalStyle = {
    ...nativeWindStyles,
    ...restStyle,
  } as React.CSSProperties;

  // -- Render --

  return (
    <NextLink
      as={as}
      className={cn(className, nativeWindClassName)}
      href={finalHref}
      id={nativeID}
      locale={locale}
      onClick={onPress}
      passHref={passHref}
      prefetch={prefetch}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      style={finalStyle as unknown as ComponentProps<typeof NextLink>['style']}
      target={target}
    >
      {children}
    </NextLink>
  );
};
