import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
// or `v1X-appRouter` if you are using Next.js v1X

export default function RootLayout(props) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>{props.children}</AppRouterCacheProvider>
      </body>
    </html>
  );
}
