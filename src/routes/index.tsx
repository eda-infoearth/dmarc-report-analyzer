
import { createSignal } from "solid-js";

// components
import { Button } from "~/components/button";
import { FileDrop } from "~/components/form";
export { ProgressCircle } from "~/components/progress";

export default function Home() {
  const [loading, setLoading] = createSignal(false);
  
  return (
    <div>
      <FileDrop />
      <div class="my-4" />
      <Button label="Click Me" onClick={() => alert("Button Clicked!")} />
      <div class="my-4" />
      <ProgressCircle loading={loading()} />
    </div>
  );
};
