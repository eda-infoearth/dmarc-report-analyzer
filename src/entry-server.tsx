// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="ja">
        <head>
          <title>DMARCレポートギュッてするやつ</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          {assets}
        </head>
        <body class="bg-pink-200 text-purple-600">
          <div id="app">
            <main class="min-h-screen bg-pink-200 text-purple-600">
              {children}
            </main>
          </div>
          {scripts}
        </body>
      </html>
    )}
  />
));
