import type { useLocalSearchParams } from 'expo-router';
import { parseUrlParamsObject } from '../utils/objectUtils';
import { extractParams } from './useRouteParams.helpers';
import type { UniversalRouteScreenProps } from './useRouteParams.types';

/** --- useRouteParams() ----------------------------------------------------------------------- */
/** -i- Gets the route search and query params on both web and mobile */
export const useRouteParams = (routeScreenProps: UniversalRouteScreenProps) => {
  const params = extractParams(routeScreenProps.params);
  const searchParams = extractParams(routeScreenProps.searchParams);
  return parseUrlParamsObject({
    ...params,
    ...searchParams,
  }) as ReturnType<typeof useLocalSearchParams>;
};
