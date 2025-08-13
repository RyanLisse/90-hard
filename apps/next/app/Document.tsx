/* @jsxImportSource react */

import UniversalRootLayout from '@app/screens/UniversalRootLayout';
import BrowserEchoScript from '@browser-echo/next/BrowserEchoScript';
import type { ReactNode } from 'react';
import ServerStylesProvider from './ServerStylesProvider';
import '../global.css';

// -i- This is a react server component
// -i- Use this file to set up your Next.js app's html skeleton
// -i- It's advised to also inject server side styles here for SSR

/* --- <Document> ------------------------------------------------------------------------------ */

const Document = (props: { children: ReactNode }) => {
  // Props
  const { children } = props;

  // -- Render --

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* - Title & Keywords - */}
        <title>Universal App Starter</title>
        <meta
          content="Universal App Starter by FullProduct.dev"
          property="description"
        />
        <meta content="Universal App Starter" property="og:title" />
        <meta
          content="Universal App Starter by FullProduct.dev"
          property="og:description"
        />
        <meta content="FullProduct.dev" property="og:site_name" />
        {/* - Image Previews - */}
        <meta
          content="https://github.com/user-attachments/assets/a2eecfd2-7889-4079-944b-1b5af6cf5ddf"
          property="og:image"
        />
        <meta content="image/png" property="og:image:type" />
        <meta
          content="A screenshot of the fullproduct.dev universal app starterkit demo"
          property="og:image:alt"
        />
        <meta content="2866" property="og:image:width" />
        <meta content="1562" property="og:image:height" />
        <meta
          content="https://github.com/user-attachments/assets/a2eecfd2-7889-4079-944b-1b5af6cf5ddf"
          property="twitter:image"
        />
        <meta content="summary_large_image" property="twitter:card" />
        <meta
          content="Full-Product Universal App Starter"
          property="twitter:title"
        />
        <meta
          content="Universal App Starter by FullProduct.dev"
          property="twitter:description"
        />
        {/* - Other - */}
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        {/* - Browser Echo for dev logging - */}
        {process.env.NODE_ENV === 'development' && <BrowserEchoScript />}
      </head>
      <body suppressHydrationWarning>
        <ServerStylesProvider>
          <UniversalRootLayout>
            <main className="flex min-h-screen min-w-screen">{children}</main>
          </UniversalRootLayout>
        </ServerStylesProvider>
      </body>
    </html>
  );
};

/* --- Exports --------------------------------------------------------------------------------- */

export default Document;
