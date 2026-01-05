import * as dayjs from "dayjs";

import { sanitizeXml } from "~/utilities/security";

interface typeDateRange {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
};
const defaultDate: typeDateRange = {
  date: "",
  startTime: "",
  endTime: "",
};

export interface typeSucceeded {
  date: typeDateRange; // レポート日付
  sentTo: string[];      // 送信先ドメイン
  sentCount: number[];   // 自社IPからの成功件数
  reporter: string;
};

export interface typeFailed {
  date: typeDateRange; // レポート日付
  sentTo: string[];      // 送信先ドメイン
  sentCount: number[];   // 自社IPからの失敗件数
  policy: "none" | "quarantine" | "reject";      // DMARCポリシー
  disposition: "none" | "quarantine" | "reject"; // 受信側の処理方針
  dkimResult: "pass" | "fail" | "none"; // DKIM認証結果
  spfResult: "pass" | "fail" | "none"; // SPF認証結果
  reporter: string;
};

export interface typeImposter {
  date: typeDateRange; // レポート日付
  sentTo: string[];      // 送信先ドメイン
  sentFrom: string[];  // 送信元ドメイン
  sentFromIps: string[];       // 不正送信元IPリスト
  sentCount: number[];   // 自社ドメインだけど別IPから送られてる件数
  disposition: "none" | "quarantine" | "reject"; // 受信側の処理方針
  dkimResult: "pass" | "fail" | "none"; // DKIM認証結果
  spfResult: "pass" | "fail" | "none"; // SPF認証結果
  reporter: string;
};

export const fileToReport = async (
    file: File,
    myIp: string, 
    myDomain: string,
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
    // server name(org name)
    const reporter = meta?.getElementsByTagName("org_name")[0]?.textContent ?? "unknown";

    const records = Array.from(xml.getElementsByTagName("record"));
    const mySucceeded: typeSucceeded = { 
      date: {...defaultDate},
      sentTo: [],
      sentCount: [],
      reporter: "",
    };
    const myFailed: typeFailed = {
      date: {...defaultDate},
      sentTo: [],
      sentCount: [],
      policy: "none",
      disposition: "none",
      dkimResult: "none",
      spfResult: "none",
      reporter: "",
    };
    const imposterResult: typeImposter = {
      date: {...defaultDate},
      sentTo: [],
      sentFrom: [],
      sentFromIps: [],
      disposition: "none",
      dkimResult: "none",
      spfResult: "none",
      sentCount: [],
      reporter: "",
    };

    const dateRange: typeDateRange = {
      date: meta ? dayjs.unix(
        Number(meta.getElementsByTagName("date_range")[0]?.getElementsByTagName("begin")[0]?.textContent ?? "0")
      ).format("YYYY-MM-DD") : "",
      startTime: meta ? dayjs.unix(
        Number(meta.getElementsByTagName("date_range")[0]?.getElementsByTagName("begin")[0]?.textContent ?? "0")
      ).format("HH:mm") : "",
      endTime: meta ? dayjs.unix(
        Number(meta.getElementsByTagName("date_range")[0]?.getElementsByTagName("end")[0]?.textContent ?? "0")
      ).format("HH:mm") : "",
    };

    records.forEach((rec) => {
      const sourceIp = rec.getElementsByTagName("source_ip")[0]?.textContent ?? "";
      const count = Number(rec.getElementsByTagName("count")[0]?.textContent ?? "0");
      
      // DMARCポリシー
      const policyPublished = xml.getElementsByTagName("policy_published")[0];
      const policyDomain = policyPublished?.getElementsByTagName("domain")[0]?.textContent ?? "none";
      
      // 送受信情報
      const envelopeTo = rec.getElementsByTagName("envelope_to")[0]?.textContent ?? "送信先隠匿";
      const envelopeFrom = rec.getElementsByTagName("envelope_from")[0]?.textContent ?? null;
      const headerFrom = rec.getElementsByTagName("header_from")[0]?.textContent ?? null;
      const sentFrom = envelopeFrom 
        ? (envelopeFrom === headerFrom) 
          ? envelopeFrom 
          : headerFrom ?? ""
        : headerFrom ?? "";
      
      // 結果
      const policyEvaluated = rec.getElementsByTagName("policy_evaluated")[0];
      const dkimResult = policyEvaluated?.getElementsByTagName("dkim")[0]?.textContent ?? "";
      const spfResult = policyEvaluated?.getElementsByTagName("spf")[0]?.textContent ?? "";
      const disposition = policyEvaluated?.getElementsByTagName("disposition")[0]?.textContent ?? "";
      console.log(disposition);

      const dkimPass = dkimResult === "pass";
      const spfPass = spfResult === "pass";
      const dmarcPass = dkimPass || spfPass;

      // DMARCの基本条件：どっちかpassしてればOK
      let deliveryResult: "pass" | "fail";
      if (dmarcPass) {
        deliveryResult = "pass";
      } else if (envelopeFrom === headerFrom && sourceIp === myIp) {
        // SPFやDKIMがfailでも、自分のサーバーから送ってるなら許容
        deliveryResult = "pass";
      } else {
        deliveryResult = "fail";
      }

      // 最終的な受信側判断（DMARCポリシーの影響）
      const result =
        deliveryResult === "pass" && disposition === "none"
          ? "OK" // 普通に届いた！
          : disposition === "quarantine"
          ? "WARN" // 迷惑メール行き
          : "NG"; // 拒否 or なりすまし

      if (sourceIp === myIp && sentFrom === myDomain) {
        // 自社からの通信
        if (result === "OK") {
          mySucceeded.date = {...dateRange};
          !mySucceeded.sentTo.includes(envelopeTo) && mySucceeded.sentTo.push(envelopeTo);
          mySucceeded.sentCount.push(count);
          mySucceeded.reporter = reporter;
        } else {
          myFailed.date = dateRange;
          !myFailed.sentTo.includes(envelopeTo) && myFailed.sentTo.push(envelopeTo);
          myFailed.sentCount.push(count);
          myFailed.policy = policyDomain as "none" | "quarantine" | "reject";
          myFailed.disposition = disposition as "none" | "quarantine" | "reject";
          myFailed.dkimResult = dkimResult as "pass" | "fail" | "none";
          myFailed.spfResult = spfResult as "pass" | "fail" | "none";
          myFailed.reporter = reporter;
        }
      } else {
        // 自社ドメインだけど別IP → なりすまし疑い
        imposterResult.date = {...dateRange};
        !imposterResult.sentTo.includes(envelopeTo) && imposterResult.sentTo.push(envelopeTo);
        !imposterResult.sentFrom.includes(sentFrom) && imposterResult.sentFrom.push(sentFrom);
        !imposterResult.sentFromIps.includes(sourceIp) && imposterResult.sentFromIps.push(sourceIp);
        imposterResult.disposition = disposition as "none" | "quarantine" | "reject";
        imposterResult.dkimResult = dkimResult as "pass" | "fail" | "none";
        imposterResult.spfResult = spfResult as "pass" | "fail" | "none";
        imposterResult.sentCount.push(count);
        imposterResult.reporter = reporter;
      }
    });

    return { mySucceeded, myFailed, imposterResult };
  };
  
  
// <feedback>
  //
  // レポート自体のメタ情報
  // <report_metadata> ... </report_metadata>
  //
  // 送信ドメインのポリシー情報
  // <policy_published> ... </policy_published>
    // 送信元ドメイン
    // <domain></domain>
    // DKIMのアライメント設定（r = relaxed / s = strict）
    // <adkim></adkim>
    // SPFのアライメント設定（r = relaxed / s = strict）
    // <aspf></aspf>
    // ドメインのポリシー（none / quarantine / reject）
    // <p></p>
    // サブドメインのポリシー（none / quarantine / reject）
    // <sp></sp>
    // ポリシー適用率（0-100）
    // <pct></pct>
  //
  // 各送信記録
  // <record> ... </record>
    // 送信元情報
    // <row> ... </row>
      // 送信元IPアドレス
      // <source_ip></source_ip>
      // 
      // 該当IPからの送信件数
      // <count></count>
      // 
      // ポリシー評価結果
      // <policy_evaluated> ... </policy_evaluated>
        // DKIM認証結果（pass / fail / none / neutral / temperror / permerror）
        // <dkim></dkim>
        // SPF認証結果（pass / fail / none / neutral / temperror / permerror）
        // <spf></spf>
        // ポリシー適用結果（none / quarantine / reject）
        // <disposition></disposition>
        //
      // 
    // 送信メールのヘッダ情報
    // <identifiers> ... </identifiers>
      // 送信先ドメイン
      // <envelope_to></envelope_to>
      // 
      // 送信元ドメイン（SMTPで名乗っている部分）
      // <envelope_from></envelope_from>
      // 
      // 送信元ドメイン（メールファイルの中身のヘッダー部分）
      // <header_from></header_from>
    // 
    // 送信認証結果の詳細情報（このアプリでの判定には使用しない）
    // <auth_results></auth_results>
      // DKIM検証結果（署名ドメインやselector付き）
      // <dkim> ... </dkim>
        // DKIM署名のドメイン
        // <domain></domain>
        // DKIM selector名
        // <selector></selector>
        // DKIMの結果（pass / fail）
        // <result></result>
      // 
      // SPF検証結果
      // <spf> ... </spf>
        // SPF認証に使われたドメイン
        // <domain></domain>
        // SPFの結果（pass / fail）
        // <result></result>
      // 
    // 
  // <record> ... </record>
  // ...
// </feedback>
