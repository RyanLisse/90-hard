import { isServer } from '@app/config';
import { Icon } from '@green-stack/components/Icon';
import { useDidMount } from '@green-stack/hooks/useDidMount';
import { useRouter } from '@green-stack/navigation/useRouter';
import { schema, z } from '@green-stack/schemas';
import {
  getThemeColor,
  Link,
  Pressable,
  Text,
  View,
} from '../components/styled';

/* --- Props ----------------------------------------------------------------------------------- */

const BackButtonProps = schema('BackButtonProps', {
  color: z.string().default(getThemeColor('--background')),
  iconSize: z.number().default(24),
  backText: z.string().optional().example('Back'),
  backLink: z.string().default('/'),
});

type BackButtonProps = z.input<typeof BackButtonProps>;

/* --- <BackButton/> --------------------------------------------------------------------------- */

const BackButton = (props: BackButtonProps) => {
  // Props
  const { color, iconSize, backText, backLink } =
    BackButtonProps.applyDefaults(props);

  // Routing
  const { canGoBack, back } = useRouter();

  // Hooks
  const didMount = useDidMount();

  // Vars
  const showBackButton = !isServer && didMount && canGoBack();

  // -- Prerender --

  const innerBackButton = (
    <View className="flex flex-row items-center p-4">
      <Icon color={color} name="ArrowLeftFilled" size={iconSize} />
      {!!backText && (
        <>
          <View className="w-[5px]" />
          <Text className={`text-xl text-[${color}]`} style={{ color }}>
            {'Back'}
          </Text>
        </>
      )}
    </View>
  );

  // -- Render --

  return showBackButton ? (
    <Pressable
      className={'absolute top-8 web:top-0 left-0'} // @ts-ignore
      onPress={back}
    >
      {innerBackButton}
    </Pressable>
  ) : (
    <Link
      className={`absolute top-8 web:top-0 left-0 text-[${color}] no-underline`}
      href={backLink}
    >
      {innerBackButton}
    </Link>
  );
};

/* --- Exports --------------------------------------------------------------------------------- */

export default BackButton;
