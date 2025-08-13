import { Image as ExpoImage } from 'expo-image';
import { cssInterop } from 'nativewind';
import { Platform } from 'react-native';
import { parseNativewindStyles } from '../styles/parseNativewindStyles';
import { cn } from '../utils/styleUtils';
import type { UniversalImageMethods, UniversalImageProps } from './Image.types';

/* --- Styles ---------------------------------------------------------------------------------- */

const StyledExpoImage = cssInterop(ExpoImage, {
  className: 'style',
});

/* --- <Image/> -------------------------------------------------------------------------------- */

const Image = (props: UniversalImageProps): JSX.Element => {
  // Props
  const {
    /* - Universal - */
    src,
    alt,
    width,
    height,
    style,
    className,
    priority,
    onError,
    onLoadEnd,
    /* - Split - */
    expoPlaceholder,
    /* - Next.js - */
    onLoad,
    fill,
    /* - Expo - */
    accessibilityLabel,
    accessible,
    allowDownscaling,
    autoplay,
    blurRadius,
    cachePolicy,
    contentFit,
    contentPosition,
    enableLiveTextInteraction,
    focusable,
    onLoadStart,
    onProgress,
    placeholderContentFit,
    recyclingKey,
    responsivePolicy,
  } = props;

  // -- Nativewind --

  const { nativeWindStyles, restStyle } = parseNativewindStyles(style);
  const finalStyle = { width, height, ...nativeWindStyles, ...restStyle };

  // -- Overrides --

  if (fill) {
    finalStyle.height = '100%';
  }
  if (fill) {
    finalStyle.width = '100%';
  }

  const finalClassName = cn(className, fill && 'h-full w-full');

  // -- Render --

  return (
    <StyledExpoImage
      /* - Universal - */
      accessibilityLabel={alt || accessibilityLabel}
      accessible={accessible}
      // @ts-expect-error
      alt={alt || accessibilityLabel}
      blurRadius={blurRadius}
      cachePolicy={cachePolicy}
      className={finalClassName}
      contentFit={contentFit}
      /* - Split - */
      contentPosition={contentPosition}
      /* - Expo - */
      focusable={focusable}
      onError={onError}
      onLoadEnd={onLoadEnd || (onLoad as any)}
      onLoadStart={onLoadStart}
      onProgress={onProgress}
      placeholder={expoPlaceholder}
      placeholderContentFit={placeholderContentFit}
      priority={priority}
      recyclingKey={recyclingKey}
      responsivePolicy={responsivePolicy}
      source={src as any}
      style={finalStyle}
      /* - Platform diffs - */
      {...Platform.select({
        web: {},
        native: {
          autoplay,
          enableLiveTextInteraction,
          allowDownscaling,
        },
      })}
    />
  );
};

/* --- Static Methods -------------------------------------------------------------------------- */

Image.clearDiskCache =
  ExpoImage.clearDiskCache as UniversalImageMethods['clearDiskCache'];
Image.clearMemoryCache =
  ExpoImage.clearMemoryCache as UniversalImageMethods['clearMemoryCache'];
Image.getCachePathAsync =
  ExpoImage.getCachePathAsync as UniversalImageMethods['getCachePathAsync'];
Image.prefetch = ExpoImage.prefetch as UniversalImageMethods['prefetch'];

/* --- Exports --------------------------------------------------------------------------------- */

export { Image };
