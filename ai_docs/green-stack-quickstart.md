# GREEN Stack Quickstart

This guide distills the key parts of FullProduct.dev docs for this repo.

- Repo root: `/Volumes/Main SSD/CascadeProjects/90-hard`
- Web app: `apps/next/`
- Mobile app: `apps/expo/`
- Core features: `features/@app-core/`
- Universal helpers: `packages/@green-stack-core/`
- Generated registries: `packages/@registries/`

---

## Up and running in no time

1. Install dependencies (root):

```bash
bun install
```

1. Run Web (Next.js):

```bash
cd apps/next
bun run dev
```

Open <http://localhost:3000> (or the port Next.js prints).

1. Run Mobile (Expo):

```bash
npm -w @app/expo start
```

Use Expo Go on iOS/Android to open the project and sign into Expo on first run if prompted.

Tip: Keep `apps/*` focused on config/routing. Implement features in `features/` and `packages/` for maximum reuse.

---

## Monorepo architecture (this repo)

- `apps/next/` – Next.js App Router (SSR, SSG, API)
- `apps/expo/` – Expo Router (iOS/Android)
- `features/@app-core/` – Reusable features, resolvers, UI, screens
- `packages/@green-stack-core/` – Starterkit & universal app helpers
- `packages/@registries/` – Generated registries (drivers, theme colors, etc.)

Guideline: Avoid writing feature code directly under `apps/*` unless necessary. Prefer:

- `features/@app-core/` for app features and screens
- `packages/*` for libraries, utils, schemas, generators

This enables copy–pasteable feature workspaces and high code reuse across platforms (and between projects).

---

## Universal routes & data fetching

Goal: Define a route once and reuse it across Web SSR, browser CSR, and Mobile.

Key pieces:

- DataBridge and `gql.tada` for typed GraphQL queries
- `createQueryBridge()` from `@green-stack/navigation` to define per-route fetch behavior for React Query
- `UniversalRouteScreen` to run the bridge in each environment and hydrate screen props

### 1) Start with component & bridge in `screens/`

Path: `features/@app-core/screens/YourScreen.tsx`

```ts
import { createQueryBridge, type HydratedRouteProps } from '@green-stack/navigation';
import { yourFetcher } from '@app/resolvers/your.resolver';

export const queryBridge = createQueryBridge({
  routeParamsToQueryKey: (params) => ['yourQuery', params.slug],
  routeParamsToQueryInput: (params) => ({ yourArgs: { slug: params.slug } }),
  routeDataFetcher: yourFetcher,
  fetcherDataToProps: (data) => ({ item: data?.yourField }),
});

type YourScreenProps = HydratedRouteProps<typeof queryBridge>;

export const YourScreen = (props: YourScreenProps) => {
  const { item } = props;
  return <></>;
};
```

### 2) Use bridge & component in `routes/`

Path: `features/@app-core/routes/your-route.tsx`

```tsx
import { YourScreen, queryBridge } from '@app/screens/YourScreen';
import { UniversalRouteScreen } from '@app/navigation';

export default (props: any) => (
  <UniversalRouteScreen
    {...props}
    queryBridge={queryBridge}
    routeScreen={YourScreen}
  />
);

// Optional Next.js segment config colocated
export const dynamic = 'auto';
export const revalidate = false;
export const runtime = 'nodejs';
```

### 3) Re-export route file inside app routers

Web: `apps/next/app/page.tsx`

```tsx
import HomeRoute, { dynamic, revalidate, runtime } from '@app/routes/index';
export default HomeRoute;
export { dynamic, revalidate, runtime };
```

Mobile: `apps/expo/app/index.tsx`

```ts
import HomeRoute from '@app/routes/index';
export default HomeRoute;
```

---

## Notes

- `gql.tada` + bridges scaffold types and queries for you; you can override `graphqlQuery` if needed.
- React Query is used across server, browser, and mobile for a unified data fetching story.
- Keep env secrets on the server; use short-lived tokens/presigned URLs for client uploads (see Cloudflare Images/R2 APIs in `apps/next/app/api/uploads/`).

---

## See also

- Full docs: <https://fullproduct.dev/docs>
- Universal Routing details: <https://fullproduct.dev/docs#universal-routes--data-fetching>
- Project README quickstart: `README.md`
