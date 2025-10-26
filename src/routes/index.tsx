
import { createSignal } from "solid-js";

// components
import { Button } from "~/components/button";
import { FileDrop } from "~/components/form";
import { ProgressCircle } from "~/components/progress";

export default function Home() {
  const [loading, setLoading] = createSignal<boolean>(false);
  
  return (
    <div>
      <FileDrop />
      <div class="my-4" />
      <Button label="Click Me" onClick={() => {setLoading(prev => {return !prev});}} />
      <div class="my-4" />
      <ProgressCircle loading={loading()} />
    </div>
  );
};
