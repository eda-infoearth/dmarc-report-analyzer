import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import Nav from "~/components/Nav";
import "./app.css";

export default function App() {
  return (
    <Router
      // base={import.meta.env.SERVER_BASE_URL}
      base="/dmarc-report-analyzer/"
      root={props => (
        <>
          {/* <Nav /> */}
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
