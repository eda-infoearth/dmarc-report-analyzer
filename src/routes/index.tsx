
import { createSignal } from "solid-js";

// components
import { Button } from "~/components/button";
import { TextInput, FileDrop } from "~/components/form";
import { ProgressCircle } from "~/components/progress";
// utilities
import { fileToReport } from "~/utilities/analyze";
import { typeSucceeded, typeFailed, typeImposter } from "~/utilities/analyze";

export default function Home() {
  const [fileEvent, setFileEvent] = createSignal<Event | null>(null);
  const [myIp, setMyIp] = createSignal<string>("");
  
  const [mySucceededReport, setMySucceededReport] = createSignal<typeSucceeded[]>([]);
  const [noSucceededMessage, setNoSucceededMessage] = createSignal<string>("");
  const [myFailedReport, setMyFailedReport] = createSignal<typeFailed[]>([]);
  const [noFailedMessage, setNoFailedMessage] = createSignal<string>("");
  const [imposterReport, setImposterReport] = createSignal<typeImposter[]>([]);
  const [noImposterMessage, setNoImposterMessage] = createSignal<string>("");
  
  const [loading, setLoading] = createSignal<boolean>(false);
  
  // ====================================================================================================
  // functions
  const formHandler = async (e: Event | null) => {
    if (!e) return;
    const input = e.target as HTMLInputElement;
    if (!input.files) return;
    setLoading(true);

    const tmpSucceeded: typeSucceeded[] = [];
    const tmpFailed: typeFailed[] = [];
    const tmpImposter: typeImposter[] = [];

    for (const file of Array.from(input.files)) {
      const tmpReport = await fileToReport(file, myIp());
      if (!tmpReport) continue;

      (tmpReport.mySucceeded.count > 0) && tmpSucceeded.push(tmpReport.mySucceeded);
      (tmpReport.myFailed.count > 0) && tmpFailed.push(tmpReport.myFailed);
      (tmpReport.imposterResult.count > 0) && tmpImposter.push(tmpReport.imposterResult);
    }

    setMySucceededReport(tmpSucceeded);
    tmpSucceeded.length === 0 ? setNoSucceededMessage("なかった～😭") : setNoSucceededMessage("");
    setMyFailedReport(tmpFailed);
    tmpFailed.length === 0 ? setNoFailedMessage("なかった～😊") : setNoFailedMessage("");
    setImposterReport(tmpImposter);
    tmpImposter.length === 0 ? setNoImposterMessage("なかった～😎") : setNoImposterMessage("");
    setLoading(false);
  };
  
  // ====================================================================================================
  // effects

  // ====================================================================================================
  // render
  return (
    <div class="bg-pink-200 text-purple-600">
      <h1>XMLまとめてアップしてくれたら仕訳けするよ～💃</h1>
      <div class="my-2" />
      <div class="my-2 w-[50vw]">
        <FileDrop label="もらったレポート" onChange={setFileEvent} />
      </div>
      <div class="my-2 w-[50vw]">
        <TextInput label="うちのIP" onChange={(v) => setMyIp(v)} />
      </div>
      <div class="my-2" />
      <Button 
        label="✨️チェックするよ～" 
        type="cute"
        disabled={(fileEvent() === null || myIp() === "") || loading()} 
        onClick={() => formHandler(fileEvent())} 
      />
      <div class="my-8" />
      <ProgressCircle loading={loading()} />
      <div class="my-8" />
      
      <h1>🚫 DMARCレポ 怪しいやつ～ 💀</h1>
      <div class="my-2" />
      <div class="overflow-x-auto shadow-lg rounded-2xl bg-white/80 backdrop-blur-md border border-pink-200">
        <table class="uppercase tracking-wide min-w-full text-sm text-white bg-red-600">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left">数</th>
              <th class="px-4 py-3 text-left">送信先IP</th>
              <th class="px-4 py-3 text-left">送信元IP</th>
              <th class="px-4 py-3 text-left">送信元ドメイン</th>
            </tr>
          </thead>
          <tbody class="rounded">
            {imposterReport().map((r, i) => (
              <tr class={`border-b border-pink-100 transition-colors duration-200 text-red-800 hover:bg-pink-50 ${i % 2 === 0 ? "bg-red-100" : "bg-red-200"}`}>
                <td class={`px-4 py-2`}>{r.count}</td>
                <td class={`px-4 py-2 w-md`}>{r.reporter}</td>
                <td class={`px-4 py-2 w-lg`}>{r.ips.join(", ")}</td>
                <td class={`px-4 py-2 w-md`}>{r.senders?.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>{noImposterMessage()}</p>
      <div class="my-8" />
      
      <h1>✅ DMARCレポ うちの大丈夫なやつ～ 😊</h1>
      <div class="my-2" />
      <div class="w-[50%] overflow-x-auto shadow-lg rounded-2xl bg-white/80 backdrop-blur-md border border-blue-200">
        <table class="uppercase tracking-wide min-w-full text-sm text-white bg-blue-500">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left">数</th>
              <th class="px-4 py-3 text-left w-md">送信先IP</th>
            </tr>
          </thead>
          <tbody>
            {mySucceededReport().map((r, i) => (
              <tr class={`border-b border-pink-100 transition-colors duration-200 text-blue-800 hover:bg-blue-50 ${i % 2 === 0 ? "bg-blue-100" : "bg-blue-200"}`}>
                <td class="px-4 py-2">{r.count}</td>
                <td class="px-4 py-2 w-md">{r.reporter}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>{noSucceededMessage()}</p>
      <div class="my-8" />
      
      <h1>❌️ DMARCレポ うちのダメだったやつ～ 😭</h1>
      <div class="my-2" />
      <div class="w-[50%] overflow-x-auto shadow-lg rounded-2xl bg-white/80 backdrop-blur-md border border-yellow-200">
        <table class="uppercase tracking-wide min-w-full text-sm text-red-800 bg-yellow-500">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left">数</th>
              <th class="px-4 py-3 text-left w-md">送信先IP</th>
            </tr>
          </thead>
          <tbody>
            {myFailedReport().map((r, i) => (
              <tr class={`border-b border-pink-100 transition-colors duration-200 text-red-800 hover:bg-yellow-50 ${i % 2 === 0 ? "bg-yellow-100" : "bg-yellow-200"}`}>
                <td class="px-4 py-2">{r.count}</td>
                <td class="px-4 py-2 w-md">{r.reporter}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>{noFailedMessage()}</p>
    </div>
  );
};
