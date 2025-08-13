import { REGISTERED_ICONS } from '@app/registries/icons.registry';
import { iconProps, z } from '@green-stack/core/svg/svg.primitives';
import { View as RNView } from 'react-native';
import { cn, styled } from '../styles';
import { Image } from './Image';

/* --- Constants ------------------------------------------------------------------------------- */

const ICON_KEYS = Object.keys(REGISTERED_ICONS) as [
  REGISTERED_ICONS,
  ...REGISTERED_ICONS[],
];

/* --- Styles ---------------------------------------------------------------------------------- */

const View = styled(RNView, '');

/* --- Types ----------------------------------------------------------------------------------- */

export const UniversalIconProps = iconProps('UniversalIconProps', {
  name: z
    .enum(ICON_KEYS)
    .describe('Name of an icon registered in the icon registry'),
  url: z
    .string()
    .url()
    .optional()
    .describe('Icon URL, for remote .svg or image icons'),
});

export type UniversalIconProps = z.infer<typeof UniversalIconProps>;

/* --- <UniversalIcon/> ------------------------------------------------------------------------ */

export const UniversalIcon = (rawProps: UniversalIconProps) => {
  // Props
  const props = UniversalIconProps.applyDefaults(rawProps);
  const { name, url } = props;

  // -- Image Icons --

  if (url) {
    return (
      <Image
        alt={name}
        className={props.className}
        height={props.size}
        src={url}
        style={props.style}
        width={props.size}
      />
    );
  }

  // -- No Icon? --

  const RegisteredIcon = REGISTERED_ICONS[name];

  if (!(name && RegisteredIcon)) {
    return null;
  }

  // -- Registered Icons --

  return (
    <View
      className={cn('justify-center align-center', props.className)}
      style={{ width: props.size, height: props.size }}
    >
      <RegisteredIcon
        className={props.className}
        color={props.color}
        size={props.size}
        {...props}
      />
    </View>
  );
};

/* --- Exports --------------------------------------------------------------------------------- */

export { UniversalIcon as Icon };
