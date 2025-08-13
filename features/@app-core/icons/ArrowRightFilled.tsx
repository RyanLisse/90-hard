import {
  getThemeColor,
  type IconProps,
  iconProps,
  Path,
  Svg,
  z,
} from '@green-stack/svg';

/* --- Types ----------------------------------------------------------------------------------- */

export const ArrowRightFilledProps = iconProps('ArrowRightFilled', {
  color: z.string().default(getThemeColor('--primary')),
});

export type ArrowRightFilledProps = IconProps<typeof ArrowRightFilledProps>;

/* --- <ArrowRightFilled/> --------------------------------------------------------------------- */

export const ArrowRightFilled = (rawProps: ArrowRightFilledProps) => {
  // Props
  const props = ArrowRightFilledProps.applyDefaults(rawProps);
  const color = ArrowRightFilledProps.getIconColor(rawProps);
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
        d="M14 6L20 12L14 18"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <Path
        d="M4 12H20"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
    </Svg>
  );
};
