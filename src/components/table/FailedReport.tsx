// /src/components/ReportTable.tsx
import { For, Show, createMemo } from "solid-js";

export interface typeFailedReport {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM～HH:MM
  reporter: string;
  sentCount: number[]; // 自社IPからの失敗件数
  sentTo: string[]; // 送信先ドメイン
  result: string; // 迷惑メール入り or 完全拒否
  reason: string; // DKIMがNG or SPFがNG
};

type Props = {
  data: typeFailedReport[];
};

export const FailedReport = (props: Props) => {
  // 日付ごとにグルーピング☆
  const grouped = createMemo(() => {
    const result: Record<string, typeFailedReport[]> = {};
    props.data.forEach((row) => {
      if (!result[row.date]) result[row.date] = [];
      result[row.date].push(row);
    });
    return result;
  });

  return (
    <div class="max-h-96 overflow-y-auto shadow-lg rounded-2xl bg-white/80 backdrop-blur-md border border-blue-200">
      <table class="uppercase tracking-wide min-w-full text-sm text-red-800 bg-yellow-500">
        <thead class="sticky top-0 text-red-800 bg-yellow-500">
          <tr>
            <th class="px-4 py-3 text-center">日付</th>
            <th class="px-4 py-3 text-center">集計時間</th>
            <th class="px-4 py-3 text-center">レポート発行サーバー</th>
            <th class="px-4 py-3 text-center">数</th>
            <th class="px-4 py-3 text-center">送信先ドメイン</th>
            <th class="px-4 py-3 text-center">結果</th>
            <th class="px-4 py-3 text-center">理由</th>
          </tr>
        </thead>
        <tbody>
          <For each={Object.entries(grouped())}>
            {([date, rows]) => (
              <For each={rows}>
                {(r, i) => (
                  <tr class={`border-b border-pink-100 transition-colors duration-200 text-red-800 hover:bg-yellow-50 bg-yellow-200`}>
                    <Show when={i() === 0}>
                      <td
                        rowspan={rows.length}
                        class="px-4 py-3"
                      >
                        {date}
                      </td>
                    </Show>
                    <td class="px-4 py-3">{r.time}</td>
                    <td class="px-4 py-3">{r.reporter}</td>
                    <td class="px-4 py-3">{r.sentCount.map((c) => <p>{c}</p>)}</td>
                    <td class="px-4 py-3">{r.sentTo.map((to) => <p>{to}</p>)}</td>
                    <td class="px-4 py-3">{r.result}</td>
                    <td class="px-4 py-3">{r.reason}</td>
                  </tr>
                )}
              </For>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
};
