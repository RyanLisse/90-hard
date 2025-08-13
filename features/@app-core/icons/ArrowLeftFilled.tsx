import {
  getThemeColor,
  type IconProps,
  iconProps,
  Path,
  Svg,
  z,
} from '@green-stack/svg';

/* --- Types ----------------------------------------------------------------------------------- */

export const ArrowLeftFilledProps = iconProps('ArrowLeftFilled', {
  color: z.string().default(getThemeColor('--primary')),
});

export type ArrowLeftFilledProps = IconProps<typeof ArrowLeftFilledProps>;

/* --- <ArrowLeftFilled/> ---------------------------------------------------------------------- */

export const ArrowLeftFilled = (rawProps: ArrowLeftFilledProps) => {
  // Props
  const props = ArrowLeftFilledProps.applyDefaults(rawProps);
  const color = ArrowLeftFilledProps.getIconColor(props);
  // Render
  return (
    <Svg
      fill="none"
      height={props.size}
      viewBox="0 0 24 24"
      width={props.size}
      {...props}
    >
      <Path
        d="M10 6L4 12L10 18"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <Path
        d="M20 12H4"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
    </Svg>
  );
};
