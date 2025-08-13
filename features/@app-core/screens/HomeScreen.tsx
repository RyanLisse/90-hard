import { isMobile } from '@app/config';
import { Icon } from '@green-stack/components/Icon';
import {
  createQueryBridge,
  type HydratedRouteProps,
} from '@green-stack/navigation';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  cn,
  H1,
  H2,
  H3,
  Image,
  Link,
  P,
  Pressable,
  ScrollView,
  Text,
  View,
} from '../components/styled';
import { healthCheckFetcher } from '../resolvers/healthCheck.query';

/* --- Data Fetching --------------------------------------------------------------------------- */

// -i- Think of a `QueryBridge` as a bridge between the route component and the data-fetching logic.
// -i- It's a way to fetch data for a route, based on the route's parameters.

// -i- The closest thing you could compare it to is next.js's `getServerSideProps`...
// -i- Except it also works to fetch data on your Native App instead of just web SSR / CSR.

export const queryBridge = createQueryBridge({
  routeDataFetcher: healthCheckFetcher,
  routeParamsToQueryKey: (routeParams) => ['healthCheck', routeParams.echo],
  routeParamsToQueryInput: (routeParams) => ({
    healthCheckArgs: {
      echo: routeParams.echo,
      verbose: routeParams.verbose,
    },
  }),
  fetcherDataToProps: (fetcherData) => ({
    serverHealth: fetcherData?.healthCheck,
  }),
});

/* --- Types ----------------------------------------------------------------------------------- */

type HomeScreenProps = HydratedRouteProps<typeof queryBridge>;

/* --- <HomeScreen/> --------------------------------------------------------------------------- */

const HomeScreen = (props: HomeScreenProps) => {
  // Props
  const { serverHealth } = props;

  // Insets
  const insets = useSafeAreaInsets();
  const insetsMobileStyle = isMobile
    ? { top: 80 + Math.max(insets.top, 16) }
    : undefined;

  // -- Effects --

  // TODO: Remove this useEffect once you're done with testing this demo
  useEffect(() => {
    const refetchServerHealth = async () => {
      const refetchedProps = await props.refetchInitialData?.();
      console.log({ props, refetchedProps });
    };
    if (serverHealth?.echo) refetchServerHealth();
  }, [!!serverHealth]);

  // -- Render --

  return (
    <>
      <StatusBar style="light" />
      <ScrollView
        contentContainerClassName="relative min-w-screen min-h-screen"
        style={{ backgroundColor: '#1e293b' }}
      >
        <View
          className={cn(
            'flex flex-1 flex-col items-center justify-between bg-slate-800',
            'lg:justify-start lg:p-24'
          )}
        >
          <View
            accessibilityElementsHidden
            className="invisible hidden h-14 lg:visible lg:flex lg:h-16 lg:w-full lg:max-w-5xl"
          >
            <GettingStarted />
          </View>

          {/* Side Icons */}

          <View
            className={cn(
              'invisible top-28 hidden h-20 w-screen max-w-5xl flex-row items-center justify-between',
              'lg:visible lg:absolute lg:top-0 lg:flex lg:h-[90%]',
              'ios:lg:top-24' // -i- If you need platform specifc flags, e.g. iPad in this case
            )}
          >
            <View className="h-[98px] w-[57px] lg:h-[197px] lg:w-[114px]">
              <Image
                alt="FullProduct.dev Starterkit Logo"
                fill
                quality={100}
                src={require('../assets/automagic-api-gen-icons.png')}
              />
            </View>
            <View className="h-[116px] w-[81px] lg:h-[233px] lg:w-[162px]">
              <Image
                alt="FullProduct.dev Starterkit Logo"
                fill
                quality={100}
                src={require('../assets/cross-platform-icons.png')}
              />
            </View>
          </View>

          {/* Logo & Tagline */}

          <View
            className={cn(
              'absolute top-28 flex h-20 w-screen max-w-5xl flex-row items-center justify-center',
              'lg:top-0 lg:h-[90%] lg:max-w-[100%]',
              'ios:lg:top-24'
            )}
            style={insetsMobileStyle}
          >
            <Link
              className="flex flex-row no-underline"
              href="https://fullproduct.dev"
              target="_blank"
            >
              <View className="h-20 w-20 lg:h-24 lg:w-24">
                <Image
                  alt="FullProduct.dev Starterkit Logo"
                  height="100%"
                  src={require('../assets/green-stack-logo.png')}
                  width="100%"
                />
              </View>
              <View className="w-5" />
              <View className="flex h-20 flex-col justify-center lg:h-24">
                <H1 className="text-left text-2xl text-gray-100 lg:text-3xl">
                  FullProduct.dev ⚡️
                </H1>
                <View className="h-0.5 lg:h-1" />
                <H3 className="text-left font-medium text-base text-slate-200 lg:text-2xl lg:text-slate-300">
                  Your Universal App Starterkit
                </H3>
              </View>
            </Link>
          </View>

          {/* Learn More */}

          <View className="h-64" />

          <View
            className={cn(
              'relative bottom-auto flex w-screen max-w-5xl flex-col items-center justify-center px-8',
              'lg:absolute lg:top-auto lg:bottom-24 lg:flex-row lg:items-start lg:px-0'
            )}
          >
            <InfoSection
              href="https://fullproduct.dev/docs/quickstart"
              isBlank
              summary="Documentation that grows as you build or paste app features"
              title="Docs 📚"
            />
            <View className="h-8 w-0 lg:h-0 lg:w-16" />
            <InfoSection
              href="https://fullproduct.dev/docs/core-concepts"
              isBlank
              summary="Discover a way of working that's portable, write-once and universal"
              title="Concepts"
            />
            <View className="h-8 w-0 lg:h-0 lg:w-16" />
            <InfoSection
              href="/subpages/Universal%20Nav"
              summary="Test universal navigation for Web & Mobile, and share up to 90% UI code"
              title="Cross Nav"
              titleIcon={
                <Icon
                  className="text-white"
                  color="white"
                  name="ArrowRightFilled"
                  size={24}
                />
              }
            />
            <View className="h-8 w-0 lg:h-0 lg:w-16" />
            <InfoSection
              href="https://fullproduct.dev/docs/generators"
              isBlank
              summary="Build even faster with generators for Routes, APIs, GraphQL & more"
              title="Codegen"
            />
          </View>

          {/* Made by */}

          <View className="h-16 lg:h-0" />

          <View
            className={cn(
              'relative flex h-14 w-screen max-w-5xl flex-row items-center justify-center',
              'lg:absolute lg:bottom-auto lg:h-16 lg:justify-end',
              'ios:lg:top-24'
            )}
          >
            <Link
              className="flex h-12 flex-row items-center no-underline lg:h-16"
              href="https://codinsonn.dev"
              target="_blank"
            >
              <View className="h-12 flex-row items-center lg:h-16">
                <Text className="text-gray-100 text-lg">By</Text>
              </View>
              <View className="w-2" />
              <View className="h-12 w-12 lg:h-16 lg:w-16">
                <Image
                  alt="Thorr / codinsonn's Profile Picture"
                  className="rounded-full"
                  fill
                  src="https://codinsonn.dev/_next/image?url=%2Fimg%2FCodelyFansLogoPic160x160.jpeg&w=256&q=75"
                  unoptimized
                />
              </View>
              <View className="w-2" />
              <View className="h-12 flex-row items-center lg:h-16">
                <Text className="font-bold text-gray-100 text-lg">
                  Thorr ⚡️ codinsonn.dev
                </Text>
              </View>
            </Link>
          </View>

          <View className="h-16 lg:h-0" />
        </View>
      </ScrollView>

      {/* Start from */}

      <View className="web:fixed absolute top-0 flex h-14 w-screen lg:hidden">
        <GettingStarted />
      </View>
    </>
  );
};

/* --- <GettingStarted/> ----------------------------------------------------------------------- */

const GettingStarted = () => {
  const insets = useSafeAreaInsets();
  const shouldUseInsets = isMobile && Dimensions.get('window').width < 1024;
  const insetsMobileStyle = shouldUseInsets
    ? { paddingTop: Math.max(insets.top, 16) }
    : undefined;
  return (
    <View
      className={cn(
        'absolute right-0 left-0 flex h-14 flex-1 flex-row items-center justify-start lg:h-16',
        'lg:ios:flex-col ios:lg:items-start'
      )}
    >
      <P
        className={cn(
          'absolute top-0 right-0 left-0 flex justify-center border-gray-700 border-b border-solid bg-slate-700 pt-4 pb-4 text-center text-gray-100 text-sm',
          'lg:relative lg:flex-initial lg:flex-shrink-1 lg:flex-grow-1 lg:flex-row lg:rounded-xl lg:border lg:bg-gray-800 lg:p-4 lg:pt-4 lg:text-lg'
        )}
        style={insetsMobileStyle}
      >
        <Text className="flex flex-row text-white">
          <Text className="text-white">Start from </Text>
          <Text className="font-bold text-white">@app/core</Text>
          <Text className="text-white">{' → '}</Text>
          <Text className="font-bold text-white">HomeScreen.tsx</Text>
        </Text>
      </P>
    </View>
  );
};

/* --- <InfoSection/> -------------------------------------------------------------------------- */

const InfoSection = (props: {
  title: string;
  titleIcon?: any;
  summary: string;
  href: string;
  isBlank?: boolean;
}) => (
  <View className="flex w-full max-w-[420px] flex-1 flex-col">
    <Link
      asChild
      className="mb-2 flex w-full flex-row items-center justify-center text-center no-underline lg:mb-4 lg:justify-start lg:text-left"
      href={props.href}
      target={
        props.isBlank || props.href.includes('http') ? '_blank' : undefined
      }
    >
      <Pressable className="flex flex-row items-center justify-center">
        <H2 className="text-2xl text-gray-100 lg:text-3xl">{props.title}</H2>
        {!!props.titleIcon && (
          <>
            <View className="w-2" />
            {props.titleIcon}
          </>
        )}
      </Pressable>
    </Link>
    <P className="text-center text-gray-500 text-lg lg:text-left">
      {props.summary}
    </P>
  </View>
);

/* --- Exports --------------------------------------------------------------------------------- */

export default HomeScreen;
