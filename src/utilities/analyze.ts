import { sanitizeXml } from "~/utilities/security";

export interface typeSucceeded {
  count: number;           // 自社IPからの成功件数
  reporter: string;       // 成功したドメイン or 詳細文字列（任意）
};

export interface typeFailed {
  count: number;           // 自社IPからの失敗件数
  reporter: string;
};

export interface typeImposter {
  count: number;           // 自社ドメインだけど別IPから送られてる件数
  reporter: string;
  ips: string[];           // 不正送信元IPリスト
  senders: string[];       // 該当送信者ドメイン
};

export const fileToReport = async (
    file: File,
    myIp: string
  ): Promise<{
    mySucceeded: typeSucceeded;
    myFailed: typeFailed;
    imposterResult: typeImposter;
  } | null> => {
    const text = await file.text();
    const clean = sanitizeXml(text);
    const parser = new DOMParser();
    const xml = parser.parseFromString(clean, "application/xml");
    
    const meta = xml.getElementsByTagName("report_metadata")[0];
    const reporter = meta?.getElementsByTagName("org_name")[0]?.textContent ?? "unknown";

    const records = Array.from(xml.getElementsByTagName("record"));
    const mySucceeded: typeSucceeded = { count: 0, reporter: "" };
    const myFailed: typeFailed = { count: 0, reporter: "" };
    const imposterResult: typeImposter = { count: 0, reporter: "", ips: [], senders: [] };

    records.forEach((rec) => {
      const sourceIp = rec.getElementsByTagName("source_ip")[0]?.textContent ?? "";
      const count = Number(rec.getElementsByTagName("count")[0]?.textContent ?? "0");
      const headerFrom = rec.getElementsByTagName("header_from")[0]?.textContent ?? "unknown";

      const evalNode = rec.getElementsByTagName("policy_evaluated")[0];
      const dkim = evalNode?.getElementsByTagName("dkim")[0]?.textContent;
      const spf = evalNode?.getElementsByTagName("spf")[0]?.textContent;
      const disp = evalNode?.getElementsByTagName("disposition")[0]?.textContent;

      const isFail = dkim === "fail" || spf === "fail" || disp === "reject";

      if (sourceIp === myIp) {
        // 自社IPの通信
        if (isFail) {
          myFailed.count += count;
          myFailed.reporter = reporter;
        } else {
          mySucceeded.count += count;
          mySucceeded.reporter = reporter;
        }
      } else if (headerFrom.includes(/* 自社ドメイン条件いれるならここに */ "")) {
        // 自社ドメインだけど別IP → なりすまし疑い
        imposterResult.count += count;
        imposterResult.reporter = reporter;
        imposterResult.ips.push(sourceIp);
        (!imposterResult.senders.includes(headerFrom)) && imposterResult.senders.push(headerFrom);
      }
    });

    return { mySucceeded, myFailed, imposterResult };
  };
  