import { useRouteParams } from '@green-stack/navigation/useRouteParams';
import type { UniversalRouteScreenProps } from '@green-stack/navigation/useRouteParams.types';
import { useRouter } from '@green-stack/navigation/useRouter';
import { StatusBar } from 'expo-status-bar';
import { Fragment } from 'react';
import BackButton from '../components/BackButton';
import { H1, Link, P, ScrollView, Text, View } from '../components/styled';
import { testableFeatures } from '../constants/testableFeatures';

/* --- <SlugScreen/> --------------------------------------------------------------------------- */

const SlugScreen = (props: UniversalRouteScreenProps) => {
  // Routing
  const { slug, count = 0 } = useRouteParams(props);
  const { push, navigate, replace, setParams } = useRouter();

  // -- Render --

  return (
    <>
      <StatusBar style="light" />
      <ScrollView
        className="flex min-h-screen flex-1 bg-slate-800"
        contentContainerClassName="min-h-screen"
      >
        <View className="flex min-h-screen flex-1 items-center justify-center bg-slate-800 py-16">
          <H1 className="text-3xl text-white">
            slug - {decodeURIComponent(slug as string)}
          </H1>
          <View className="h-4" />
          <P className=" max-w-[400px] px-6 text-center text-base text-gray-300">
            Universal URL routing built on Expo & Next.js routers, shared
            between Web and Native. e.g. Tap to change the{' '}
            <Text className="font-bold text-white">count {`(${count})`}</Text>{' '}
            param:
          </P>
          <View className="h-2" />
          <Text
            className="text-center text-base text-link underline"
            onPress={() => setParams({ count: `${+count + 1}` })}
          >
            {'router.setParams()'}
          </Text>

          {/* Nav & Routing Tests */}

          <View className="my-6 h-1 w-12 bg-slate-600" />

          <Text
            className="text-center text-base text-link underline"
            onPress={() => push('/subpages/push')}
          >
            {'router.push()'}
          </Text>
          <View className="h-4" />
          <Text
            className="text-center text-base text-link underline"
            onPress={() => navigate('/subpages/navigate')}
          >
            {'router.navigate()'}
          </Text>
          <View className="h-4" />
          <Text
            className="text-center text-base text-link underline"
            onPress={() => replace('/subpages/replace')}
          >
            {'router.replace()'}
          </Text>

          {/* Other Tests */}

          <View className="my-6 h-1 w-12 bg-slate-600" />

          {testableFeatures.map((feature, index) => (
            <Fragment key={feature.link}>
              <Link className="text-center text-base" href={feature.link}>
                {feature.title}
              </Link>
              {index < testableFeatures.length - 1 && <View className="h-2" />}
            </Fragment>
          ))}

          {/* Try the full startkit? */}

          <View className="my-6 h-1 w-12 bg-slate-600" />

          <P className="mt-2 px-6 text-center text-base text-gray-300">
            Upgrade your Universal App Setup?
          </P>
          <Link
            className="mt-4 text-center font-bold text-lg no-underline"
            href="https://fullproduct.dev"
            target="_blank"
          >
            FullProduct.dev
          </Link>
        </View>
      </ScrollView>
      <BackButton color="#FFFFFF" />
    </>
  );
};

/* --- Exports --------------------------------------------------------------------------------- */

export default SlugScreen;
