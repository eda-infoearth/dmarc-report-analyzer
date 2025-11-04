// /src/components/ReportTable.tsx
import { For, Show, createMemo } from "solid-js";

type RowData = {
  date: string;
  time: string;
  value: string;
};

export interface typeSuccessReport {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM～HH:MM
  reporter: string;
  sentCount: number[]; // 自社IPからの成功件数
  sentTo: string[]; // 送信先ドメイン
};

type Props = {
  data: typeSuccessReport[];
};

export const SuccessReport = (props: Props) => {
  // 日付ごとにグルーピング☆
  const grouped = createMemo(() => {
    const result: Record<string, typeSuccessReport[]> = {};
    props.data.forEach((row) => {
      if (!result[row.date]) result[row.date] = [];
      result[row.date].push(row);
    });
    return result;
  });

  return (
    <div class="max-h-96 overflow-y-auto shadow-lg rounded-2xl bg-white/80 backdrop-blur-md border border-blue-200">
      <table class="uppercase tracking-wide min-w-full text-sm text-white bg-blue-500">
        <thead class="sticky top-0 text-white bg-blue-600">
          <tr>
            <th class="px-4 py-3 text-center">日付</th>
            <th class="px-4 py-3 text-center">集計時間</th>
            <th class="px-4 py-3 text-center">レポート発行サーバー</th>
            <th class="px-4 py-3 text-center">数</th>
            <th class="px-4 py-3 text-center">送信先ドメイン</th>
          </tr>
        </thead>
        <tbody>
          <For each={Object.entries(grouped())}>
            {([date, rows]) => (
              <For each={rows}>
                {(r, i) => (
                  <tr class={`border-b border-pink-100 transition-colors duration-200 text-blue-800 hover:bg-blue-50 bg-blue-200`}>
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
