import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";

export default function App() {
  const isDev = import.meta.env.IS_DEVELOPMENT === "true";
  
  return (
    <Router
      base={isDev ? "/dmarc-report-analyzer/" : "/dmarc-report-analyzer/"}
      root={props => (
        <>
          <Suspense>
            <div class="px-16 py-8 bg-pink-200">{props.children}</div>
          </Suspense>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
