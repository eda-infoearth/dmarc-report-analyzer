// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

let nonce = "";

export default createHandler((context) => {
  // get nonce from middleware
  nonce = context.request.headers.get("csp-nonce") || "";
  console.log("entry-server nonce:", nonce);
  
  // set nonce for accept tailwindcss
  return (
    <StartServer
      document={({ assets, children, scripts }) => (
        <html lang="ja">
          <head>
            <title>DMARCレポートギュッてするやつ</title>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
            {assets}
            <script nonce={nonce} src="/build/client.js" />
            <link rel="stylesheet" href="/build/style.css" nonce={nonce} />
            <link rel="stylesheet" href="/src/app.css" nonce={nonce} />
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
  );
}, { nonce: nonce });
