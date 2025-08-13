import {
  getThemeColor,
  type IconProps,
  iconProps,
  Path,
  Svg,
  z,
} from '@green-stack/svg';

/* --- Types ----------------------------------------------------------------------------------- */

export const ChevronUpFilledProps = iconProps('ChevronUpFilled', {
  color: z.string().default(getThemeColor('--primary')),
});

export type ChevronUpFilledProps = IconProps<typeof ChevronUpFilledProps>;

/* --- <ChevronUpFilled/> -------------------------------------------------------------------- */

export const ChevronUpFilled = (rawProps: ChevronUpFilledProps) => {
  // Props
  const props = ChevronUpFilledProps.applyDefaults(rawProps);
  const color = ChevronUpFilledProps.getIconColor(props);
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
        clipRule="evenodd"
        d="M3.293 16.707a1 1 0 0 0 1.414 0L12 9.414l7.293 7.293a1 1 0 0 0 1.414-1.414l-8-8a1 1 0 0 0-1.414 0l-8 8a1 1 0 0 0 0 1.414Z"
        fill={color}
        fillRule="evenodd"
      />
    </Svg>
  );
};
