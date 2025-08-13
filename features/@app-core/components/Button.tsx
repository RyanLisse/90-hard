import { isWeb } from '@app/config';
import type { KnownRoutes } from '@app/registries/routeManifest.generated';
import { Icon, UniversalIconProps } from '@green-stack/components/Icon';
import { useRouter } from '@green-stack/navigation';
import type {
  RequireParamsIfDynamic,
  UniversalLinkProps,
} from '@green-stack/navigation/Link.types';
import { schema, z } from '@green-stack/schemas';
import { useThemeColor } from '@green-stack/styles';
import { type ReactNode, useEffect, useState } from 'react';
import type { PressableProps } from 'react-native';
import { cn, Link, Pressable, Text, View } from './styled';

/* --- Types ----------------------------------------------------------------------------------- */

export const ButtonProps = schema('ButtonProps', {
  type: z
    .enum([
      'primary',
      'secondary',
      'outline',
      'link',
      'warn',
      'danger',
      'info',
      'success',
    ])
    .default('primary'),
  text: z.string().default('').example('Press me'),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  href: z.string().url().optional().example('https://fullproduct.dev'),
  iconLeft: UniversalIconProps.shape.name.optional(),
  iconRight: UniversalIconProps.shape.name
    .optional()
    .example('ArrowRightFilled'),
  disabled: z.boolean().default(false),
  fullWidth: z.boolean().default(false),
  className: z.string().optional(),
  textClassName: z.string().optional(),
  iconSize: z.number().default(16),
  // - Pressable Props -
  hitSlop: z.number().default(10),
  // - Link Props -
  target: z
    .enum(['_blank', '_self', '_parent', '_top'])
    .default('_self')
    .example('_blank'),
  replace: z.boolean().optional(),
  push: z.boolean().optional(),
});

export type ButtonProps<HREF extends KnownRoutes | never = never> = z.input<
  typeof ButtonProps
> & {
  children?: ReactNode;
  style?: PressableProps['style'] | UniversalLinkProps['style'];
  // - Pressable Props -
  onPress?: PressableProps['onPress'] | UniversalLinkProps['onPress'];
  onPressIn?: PressableProps['onPressIn'];
  onPressOut?: PressableProps['onPressOut'];
  onHoverIn?: PressableProps['onHoverIn'];
  onHoverOut?: PressableProps['onHoverOut'];
  onLongPress?: PressableProps['onLongPress'];
  onBlur?: PressableProps['onBlur'];
  onFocus?: PressableProps['onFocus'];
  // - Link Props -
  href?: HREF | undefined;
} & RequireParamsIfDynamic<HREF>;

/* --- <Button/> ------------------------------------------------------------------------------- */

export const Button = <HREF extends KnownRoutes | never = never>(
  rawProps: ButtonProps<HREF>
) => {
  // Props
  const props = ButtonProps.applyDefaults(rawProps);
  const { text, children } = props;

  // State
  const [didMount, setDidMount] = useState(false);

  // Hooks
  const router = useRouter();

  // Vars
  const buttonText = typeof children === 'string' ? children : text;

  // Flags
  const isPressable = !!props.onPress && !didMount;
  const asLink = !!props.href && !isPressable && !props.disabled;
  const hasLabel = !!buttonText || !!children;
  const hasLeftIcon = !!props.iconLeft;
  const hasRightIcon = !!props.iconRight;

  // -- Styles --

  const buttonClassNames = cn(
    'relative flex flex-row items-center justify-center rounded-md no-underline',
    'web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
    props.type === 'primary' &&
      'bg-primary web:hover:opacity-90 active:opacity-90',
    props.type === 'secondary' &&
      'bg-secondary-foreground web:hover:opacity-80 active:opacity-80',
    props.type === 'outline' &&
      'border border-input bg-transparent web:hover:bg-accent web:hover:text-accent-foreground active:bg-accent',
    props.type === 'link' &&
      'border-none bg-transparent web:hover:bg-transparent active:bg-transparent',
    props.type === 'warn' && 'bg-warn web:hover:opacity-90 active:opacity-90',
    props.type === 'danger' &&
      'bg-danger web:hover:opacity-90 active:opacity-90',
    props.type === 'info' && 'bg-info web:hover:opacity-90 active:opacity-90',
    props.type === 'success' &&
      'bg-success web:hover:opacity-90 active:opacity-90',
    props.size === 'sm' && 'p-2',
    props.size === 'md' && 'p-3',
    props.size === 'lg' && 'p-4',
    props.type === 'link' && 'justify-start p-0',
    props.disabled && 'cursor-not-allowed opacity-75',
    props.fullWidth ? 'w-full' : 'self-start',
    props.className
  );

  const textClassNames = cn(
    'no-underline',
    props.type === 'primary' && 'text-primary-foreground',
    props.type === 'secondary' && 'text-secondary',
    props.type === 'outline' && 'text-primary',
    props.type === 'link' && 'text-link',
    props.type === 'warn' && 'text-primary-foreground',
    props.type === 'danger' && 'text-primary-foreground',
    props.type === 'info' && 'text-primary-foreground',
    props.type === 'success' && 'text-primary-foreground',
    props.size === 'sm' && 'text-sm',
    props.size === 'md' && 'text-base',
    props.size === 'lg' && 'text-lg',
    props.disabled && 'cursor-not-allowed text-muted',
    props.textClassName,
    hasLeftIcon && 'pl-2',
    hasRightIcon && 'pr-2'
  );

  const iconClassNames = cn(
    props.type === 'primary' && 'text-primary-foreground',
    props.type === 'secondary' && 'text-secondary',
    props.type === 'outline' && 'text-primary',
    props.type === 'link' && 'text-link',
    props.type === 'warn' && 'text-primary-foreground',
    props.type === 'danger' && 'text-primary-foreground',
    props.type === 'info' && 'text-primary-foreground',
    props.type === 'success' && 'text-primary-foreground',
    props.disabled && 'text-muted'
  );

  const colorPrimaryInverse = useThemeColor('--primary-foreground');
  const colorPrimary = useThemeColor('--primary');
  const colorLink = useThemeColor('--link');
  const colorMuted = useThemeColor('--muted');

  let iconColor = colorPrimaryInverse as string;
  if (props.type === 'secondary') {
    iconColor = colorPrimary;
  }
  if (props.type === 'outline') {
    iconColor = colorPrimary;
  }
  if (props.type === 'link') {
    iconColor = colorLink;
  }
  if (props.type === 'warn') {
    iconColor = colorPrimaryInverse;
  }
  if (props.type === 'danger') {
    iconColor = colorPrimaryInverse;
  }
  if (props.type === 'info') {
    iconColor = colorPrimaryInverse;
  }
  if (props.type === 'success') {
    iconColor = colorPrimaryInverse;
  }
  if (props.disabled) {
    iconColor = colorMuted;
  }

  let iconSize = props.iconSize;
  if (props.size === 'sm') {
    iconSize = 12;
  }
  if (props.size === 'lg') {
    iconSize = 18;
  }

  // -- Handlers --

  const onButtonPress = (evt: any$TooComplex) => {
    // Ignore?
    if (props.disabled) {
      return;
    }
    // Call event handler?
    props.onPress?.(evt);
    // Open in new tab?
    const isWebBlankLink = isWeb && props.href && props.target === '_blank';
    if (isWebBlankLink) {
      return window.open(props.href, '_blank');
    }
    // Navigate?
    if (props.href && props.replace) {
      return router.replace(props.href);
    }
    if (props.href && props.push) {
      return router.push(props.href);
    }
    if (props.href) {
      router.navigate(props.href);
    }
  };

  // -- Effects --

  useEffect(() => {
    setDidMount(true);
  }, []);

  // -- Content --

  const buttonContent = (
    <>
      {hasLeftIcon && (
        <View className="justify-center">
          <Icon
            className={iconClassNames}
            color={iconColor}
            name={props.iconLeft!}
            size={iconSize}
          />
        </View>
      )}
      {hasLabel && (
        <View className="">
          {buttonText ? (
            <Text className={textClassNames}>{buttonText}</Text>
          ) : (
            children
          )}
        </View>
      )}
      {hasRightIcon && (
        <View className="justify-center">
          <Icon
            className={iconClassNames}
            color={iconColor}
            name={props.iconRight!}
            size={iconSize}
          />
        </View>
      )}
    </>
  );

  // -- Render as Link --

  if (asLink) {
    return (
      // @ts-expect-error
      <Link
        asChild
        className={buttonClassNames}
        disabled={props.disabled}
        hitSlop={props.hitSlop}
        href={props.href!}
        onPress={onButtonPress as UniversalLinkProps['onPress']}
        params={props.params!}
        push={props.push}
        replace={props.replace}
        style={props.style}
        target={props.target}
      >
        <Pressable className="flex flex-row">{buttonContent}</Pressable>
      </Link>
    );
  }

  // -- Render --

  return (
    <Pressable
      className={buttonClassNames} // @ts-ignore
      disabled={props.disabled}
      hitSlop={props.hitSlop}
      onBlur={props.onBlur}
      onFocus={props.onFocus}
      onHoverIn={props.onHoverIn}
      onHoverOut={props.onHoverOut}
      onLongPress={props.onLongPress}
      onPress={onButtonPress}
      onPressIn={props.onPressIn}
      onPressOut={props.onPressOut}
      style={props.style}
    >
      {buttonContent}
    </Pressable>
  );
};

/* --- Documentation --------------------------------------------------------------------------- */

export const getDocumentationProps = ButtonProps.documentationProps('Button');
