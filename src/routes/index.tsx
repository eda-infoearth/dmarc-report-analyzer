
import { createSignal, createEffect } from "solid-js";

// components
import { Button } from "~/components/button";
import { TextInput, FileDrop } from "~/components/form";
import { ProgressCircle } from "~/components/progress";
import { 
  SuccessReport, typeSuccessReport, 
  FailedReport, typeFailedReport,
  ImposterReport, typeImposterReport
} from "~/components/table";
// utilities
import { fileToReport } from "~/utilities/analyze";
import { typeSucceeded, typeFailed, typeImposter } from "~/utilities/analyze";

export default function Home() {
  const [fileEvent, setFileEvent] = createSignal<Event | null>(null);
  const [myIp, setMyIp] = createSignal<string>("");
  const [myDomain, setMyDomain] = createSignal<string>("");
  
  const [successCount, setSuccessCount] = createSignal<number>(0);
  const [successReport, setSuccessReport] = createSignal<typeSuccessReport[]>([]);
  const [noSucceededMessage, setNoSucceededMessage] = createSignal<string>("");
  
  const [failedCount, setFailedCount] = createSignal<number>(0);
  const [failedReport, setFailedReport] = createSignal<typeFailedReport[]>([]);
  const [noFailedMessage, setNoFailedMessage] = createSignal<string>("");
  
  const [imposterCount, setImposterCount] = createSignal<number>(0);
  const [imposterReport, setImposterReport] = createSignal<typeImposterReport[]>([]);
  const [noImposterMessage, setNoImposterMessage] = createSignal<string>("");
  
  const [loading, setLoading] = createSignal<boolean>(false);
  
  // ====================================================================================================
  // functions
  const formHandler = async (e: Event | null) => {
    if (!e) return;
    const input = e.target as HTMLInputElement;
    if (!input.files) return;
    setLoading(true);
    resetSignal();

    const tmpSucceeded: typeSucceeded[] = [];
    const tmpFailed: typeFailed[] = [];
    const tmpImposter: typeImposter[] = [];

    for (const file of Array.from(input.files)) {
      const tmpReport = await fileToReport(file, myIp(), myDomain());
      if (!tmpReport) continue;

      (tmpReport.mySucceeded.sentCount.length > 0) && tmpSucceeded.push(tmpReport.mySucceeded);
      (tmpReport.myFailed.sentCount.length > 0) && tmpFailed.push(tmpReport.myFailed);
      (tmpReport.imposterResult.sentCount.length > 0) && tmpImposter.push(tmpReport.imposterResult);
    }

    // data.date.date: YYYY-MM-DD
    tmpSucceeded.sort((a, b) => Number(new Date(a.date.date)) - Number(new Date(b.date.date)));
    const combinedSucceeded = combineSuccessed( tmpSucceeded );
    tmpFailed.sort((a, b) => Number(new Date(a.date.date)) - Number(new Date(b.date.date)));
    const combinedFailed = combineFailed( tmpFailed );
    tmpImposter.sort((a, b) => Number(new Date(a.date.date)) - Number(new Date(b.date.date)));
    const combinedImposter = combineImposter( tmpImposter );

    setSuccessReport(combinedSucceeded);
    combinedSucceeded.length === 0 ? setNoSucceededMessage("なかった～😭") : setNoSucceededMessage("");
    setFailedReport(combinedFailed);
    combinedFailed.length === 0 ? setNoFailedMessage("なかった～😊") : setNoFailedMessage("");
    setImposterReport(combinedImposter);
    combinedImposter.length === 0 ? setNoImposterMessage("なかった～😎") : setNoImposterMessage("");

    setLoading(false);
  };

  const resetSignal = () => {
    setSuccessCount(0);
    setSuccessReport([]);
    setNoSucceededMessage("");

    setFailedCount(0);
    setFailedReport([]);
    setNoFailedMessage("");

    setImposterCount(0);
    setImposterReport([]);
    setNoImposterMessage("");
  };
  
  const combineSuccessed = (reports: typeSucceeded[]): typeSuccessReport[] => {
    const combined: typeSuccessReport[] = [];
    let totalCount = 0;

    reports.forEach((report) => {
      report.sentCount.map(count => totalCount += count);

      combined.push({
        date: report.date.date,
        time: `${report.date.startTime}～${report.date.endTime}`,
        sentTo: report.sentTo,
        sentCount: report.sentCount,
        reporter: report.reporter,
      });
    });
    
    setSuccessCount(totalCount);
    return combined;
  };
  
  const combineFailed = (reports: typeFailed[]): typeFailedReport[] => {
    const combined: typeFailedReport[] = [];
    let totalCount = 0;

    reports.forEach((report) => {
      report.sentCount.map(count => totalCount += count);

      const resultStr = report.disposition === "quarantine" ? "迷惑メール入り🤫" : "完全拒否😤";
      const reasonStr = report.dkimResult !== "pass" ? "DKIMがNG" : report.spfResult !== "pass" ? "SPFがNG" : "不明";
      
      combined.push({
          date: report.date.date,
          time: `${report.date.startTime}～${report.date.endTime}`,
          reporter: report.reporter,
          sentCount: report.sentCount,
          sentTo: report.sentTo,
          result: resultStr,
          reason: reasonStr,
        });
    });
    
    setFailedCount(totalCount);
    return combined;
  };
  
  const combineImposter = (reports: typeImposter[]): typeImposterReport[] => {
    const combined: typeImposterReport[] = [];
    let totalCount = 0;

    reports.forEach((report) => {
      report.sentCount.map(count => totalCount += count);
      const resultStr = report.disposition === "none" ? "受信（要チェケ）🤔" : report.disposition === "quarantine" ? "迷惑メール入り🤫" : "完全拒否😤";
      const reasonStr = report.dkimResult !== "pass" ? "DKIMがNG" : report.spfResult !== "pass" ? "SPFがNG" : "不明";
      
      combined.push({
        date: report.date.date,
        time: `${report.date.startTime}～${report.date.endTime}`,
        reporter: report.reporter,
        sentCount: report.sentCount,
        sentTo: report.sentTo,
        sentFrom: report.sentFrom,
        sentFromIps: report.sentFromIps,
        result: resultStr,
        reason: reasonStr,
      });
    });
    
    setImposterCount(totalCount);
    return combined;
  };

  // ====================================================================================================
  // effects

  // ====================================================================================================
  // render
  return (
    <div class="bg-pink-200 text-purple-600">
      <h1>XMLまとめてアップしてくれたら仕訳けするよ～💃</h1>
      <div class="my-2" />
      <div class="my-2 w-[50vw] grid grid-cols-2 gap-8">
        <TextInput label="うちのIP" onChange={(v) => setMyIp(v)} />
        <TextInput label="うちのドメイン" onChange={(v) => setMyDomain(v)} />
      </div>
      <div class="my-2 w-[50vw]">
        <FileDrop label="もらったレポート" onChange={setFileEvent} />
      </div>
      <div class="my-2" />
      <div class="w-[50vw] flex justify-center">
        <Button 
          label="✨️チェックするよ～" 
          type="cute"
          disabled={(fileEvent() === null || myIp() === "") || myDomain() === "" || loading()} 
          onClick={() => formHandler(fileEvent())} 
        />
      </div>
      <div class="my-8" />
      <ProgressCircle loading={loading()} />
      <div class="my-8" />
      
      <h1>🚫 DMARCレポ 怪しいやつ～ 💀</h1>
      <div class="my-2" />
      {(imposterReport().length > 0 || noImposterMessage() !== "") && `合計：${imposterCount()}通`}
      <div class="my-2" />
      <ImposterReport data={imposterReport()} />
      <p>{noImposterMessage()}</p>
      <div class="my-8" />
      
      <h1>❌️ DMARCレポ うちのダメだったやつ～ 😭</h1>
      <div class="my-2" />
      {(failedReport().length > 0 || noFailedMessage() !== "") && `合計：${failedCount()}通`}
      <div class="my-2" />
      <FailedReport data={failedReport()} />
      <p>{noFailedMessage()}</p>
      <div class="my-8" />
      
      <h1>✅ DMARCレポ うちの大丈夫なやつ～ 😊</h1>
      <div class="my-2" />
      {(successReport().length > 0 || noSucceededMessage() !== "") && `合計：${successCount()}通`}
      <div class="my-2" />
      <SuccessReport data={successReport()} />
      <p>{noSucceededMessage()}</p>
    </div>
  );
};
