// 公式LINE（問い合わせ・相談の補助チャネル）
// ※ LINEアカウントが変わった場合はこのURLと public/images/line-qr.png を差し替え
export const LINE_URL =
  "https://s.lmes.jp/landing-qr/2009477605-NXOfJLH0?uLand=n4pPW4";

// 申し込みステータスラベル（管理画面で使用）
export const STATUS_MAP: Record<string, string> = {
  new: "新規",
  contacted: "連絡済み",
  scheduled: "日程確定",
  completed: "完了",
  cancelled: "キャンセル",
};
