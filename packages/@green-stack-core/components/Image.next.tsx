import NextImage from 'next/image';
import { parseNativewindStyles } from '../styles/parseNativewindStyles';
import { cn } from '../utils/styleUtils';
import type { UniversalImageMethods, UniversalImageProps } from './Image.types';

/* --- <Image/> -------------------------------------------------------------------------------- */

const Image = (props: UniversalImageProps): JSX.Element => {
  // Props
  const {
    /* - Universal - */
    src,
    alt = 'Alt description missing in image',
    width,
    height,
    className,
    style = {},
    priority = 'normal',
    onError,
    onLoadEnd,
    /* - Split - */
    nextPlaceholder,
    /* - Next.js - */
    loader,
    fill: fillProp,
    sizes,
    quality,
    onLoad,
    loading,
    blurDataURL,
    unoptimized,
    /* - Expo - */
    accessibilityLabel,
    contentFit,
  } = props;

  // -- Nativewind --

  const { nativeWindStyles, nativeWindClassName, restStyle } =
    parseNativewindStyles(style);
  const finalStyle = {
    width,
    height,
    ...nativeWindStyles,
    ...restStyle,
  } as React.CSSProperties;

  // -- Overrides --

  const fill = fillProp === true || width === '100%' || height === '100%';

  if (fill) {
    finalStyle.height = '100%';
  }
  if (fill) {
    finalStyle.width = '100%';
  }
  if (fill) {
    finalStyle.objectFit = contentFit || 'cover';
  }

  const finalClassName = cn(
    className,
    nativeWindClassName,
    fill && 'h-full w-full'
  );

  // -- Render --

  return (
    <NextImage
      /* - Universal - */
      alt={alt || accessibilityLabel!}
      blurDataURL={blurDataURL}
      className={finalClassName}
      fill={fill}
      height={fill ? undefined : (height as any)}
      loader={loader}
      loading={loading}
      onError={onError as any}
      onLoad={(onLoad || onLoadEnd) as any}
      /* - Split - */
      placeholder={nextPlaceholder}
      /* - Next.js - */
      priority={priority === 'high'}
      quality={quality}
      sizes={sizes}
      src={src as any}
      style={finalStyle}
      unoptimized={unoptimized}
      width={fill ? undefined : (width as any)}
    />
  );
};

/* --- Static Methods -------------------------------------------------------------------------- */

Image.clearDiskCache = (() => {}) as UniversalImageMethods['clearDiskCache'];
Image.clearMemoryCache =
  (() => {}) as UniversalImageMethods['clearMemoryCache'];
Image.getCachePathAsync = ((
  _cacheKey: string
) => {}) as UniversalImageMethods['getCachePathAsync']; // prettier-ignore
Image.prefetch = ((
  _urls: string | string[],
  _cachePolicy?: 'memory' | 'memory-disk'
) => {}) as UniversalImageMethods['prefetch']; // prettier-ignore

/* --- Exports --------------------------------------------------------------------------------- */

export { Image };
