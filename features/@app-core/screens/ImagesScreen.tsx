import { StatusBar } from 'expo-status-bar';
import BackButton from '../components/BackButton';
import { Image, ScrollView, Text, View } from '../components/styled';

/* --- Images ---------------------------------------------------------------------------------- */

const greenStackLogo = require('../assets/green-stack-logo.png');

/* --- <ImagesScreen/> ------------------------------------------------------------------------- */

const ImagesScreen = () => (
  <>
    <StatusBar style="light" />
    <ScrollView
      className="flex min-h-screen flex-1 bg-slate-800"
      contentContainerClassName="min-h-screen"
    >
      <View className="flex min-h-screen flex-1 items-center justify-center bg-slate-800 py-16">
        {/* - Example 1 - */}
        <Image
          alt="Example Green Stack Logo"
          height={60}
          src={greenStackLogo}
          width={60}
        />
        <Text className="mt-2 mb-4 text-center text-base text-gray-200">
          <Text className="font-bold text-gray-200">src=static-require</Text>
          <Text className="text-gray-200"> | width: 60 | height: 60</Text>
        </Text>
        {/* - Example 2 - */}
        <Image
          alt="Example Profile picture"
          height={60}
          src="https://codinsonn.dev/_next/image?url=%2Fimg%2FCodelyFansLogoPic160x160.jpeg&w=256&q=75"
          width={60}
        />
        <Text className="mt-2 mb-4 text-center text-base text-gray-200">
          <Text className="font-bold text-gray-200">src=external-url</Text>
          <Text className="text-gray-200"> | width: 60 | height: 60</Text>
        </Text>
        {/* - Example 3 - */}
        <View className="relative h-[80px] w-[60px] border-[1px] border-gray-200 border-dashed">
          <Image alt="Example Green Stack Logo" fill src={greenStackLogo} />
        </View>
        <Text className="mt-2 mb-4 text-center text-base text-gray-200">
          <Text className="text-gray-200">wrapper=50x80, </Text>
          <Text className="font-bold text-gray-200">relative | fill=true</Text>
        </Text>
        {/* - Example 4 - */}
        <View className="relative h-[60px] w-[80px] border-[1px] border-gray-200 border-dashed">
          <Image
            alt="Example Green Stack Logo"
            contentFit="contain"
            fill
            src={greenStackLogo}
          />
        </View>
        <Text className="mt-2 mb-4 text-center text-base text-gray-200">
          <Text className="text-gray-200">wrapper=80x60, </Text>
          <Text className="font-bold text-gray-200">
            relative | fill | contentFit=contain
          </Text>
        </Text>
      </View>
    </ScrollView>
    <BackButton backLink="/subpages/Universal%20Nav" color="#FFFFFF" />
  </>
);

/* --- Exports --------------------------------------------------------------------------------- */

export default ImagesScreen;
