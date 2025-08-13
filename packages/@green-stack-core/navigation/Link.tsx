import type { KnownRoutes } from '@app/registries/routeManifest.generated';
import React from 'react';
import { CoreContext } from '../context/CoreContext';
import type { UniversalLinkProps } from './Link.types';

/* --- <Link/> --------------------------------------------------------------------------------- */

export const Link = <HREF extends KnownRoutes>(
  props: UniversalLinkProps<HREF>
) => {
  // Context
  const { contextLink: ContextLink } = React.useContext(CoreContext);

  // @ts-expect-error
  return <ContextLink {...props} />;
};
