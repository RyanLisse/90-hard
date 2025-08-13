import { useContext } from 'react';
import { CoreContext } from '../context/CoreContext';
import type { UniversalRouteScreenProps } from './useRouteParams.types';

/* --- useRouteParams() ------------------------------------------------------------------------ */

export const useRouteParams = (routeScreenProps: UniversalRouteScreenProps) => {
  const { useContextRouteParams } = useContext(CoreContext);
  return useContextRouteParams(routeScreenProps);
};
