export type SlipProcessedParams = {
  success: number;
  total: number;
};

export type EmptyParams = undefined;

export type AiReplyParams = {
  text: string;
};

export type GoalReminderParams = {
  goalName: string;
  currentAmount: number;
  targetAmount: number;
};

export type NotificationParamsMap = {
  SLIP_PROCESSED: SlipProcessedParams;
  DAILY_REMINDER: EmptyParams;
  AI_REPLY: AiReplyParams;
  GOAL_REMINDER: GoalReminderParams;
};

export const NOTIFICATION_TEMPLATES = {
  SLIP_PROCESSED: {
    th: {
      title: "SATISATANG",
      body: (p: SlipProcessedParams) => {
        if (p.success === p.total)
          return `อ่านสลิปทั้ง ${p.total} รายการเสร็จแล้ว ตรวจสอบเพื่อบันทึกได้เลยครับ`;
        if (p.success > 0)
          return `เตรียมข้อมูลเสร็จ ${p.success} รายการ (อ่านไม่ได้ ${p.total - p.success} รายการ) มาเช็คดูก่อนนะครับ`;
        return "ไม่สามารถอ่านข้อมูลจากสลิปได้เลย รบกวนลองใหม่อีกครั้งครับ";
      },
    },
    en: {
      title: "SATISATANG",
      body: (p: SlipProcessedParams) => {
        if (p.success === p.total)
          return `Extraction for all ${p.total} slips is complete. Ready for your review.`;
        if (p.success > 0)
          return `Prepared ${p.success} slips (${p.total - p.success} failed). Please check them.`;
        return "Could not extract data from the images. Please try again.";
      },
    },
  },
  DAILY_REMINDER: {
    th: {
      title: "SATISATANG",
      body: (_?: EmptyParams) => "อย่าลืมเช็ครายจ่ายวันนี้ และบันทึกลงแอปด้วยนะ!",
    },
    en: {
      title: "SATISATANG",
      body: (_?: EmptyParams) =>
        "Don't forget to check your expenses and log them today!",
    },
  },
  AI_REPLY: {
    th: {
      title: "พี่สตางค์",
      body: (p: AiReplyParams) => {
        const preview =
          p.text.length > 50 ? `${p.text.substring(0, 50)}...` : p.text;
        return `ตอบกลับคุณแล้ว: "${preview}"`;
      },
    },
    en: {
      title: "P' Satang",
      body: (p: AiReplyParams) => {
        const preview =
          p.text.length > 50 ? `${p.text.substring(0, 50)}...` : p.text;
        return `Replied: "${preview}"`;
      },
    },
  },
  GOAL_REMINDER: {
    th: {
      title: "สะกิดเป้าหมายคืนนี้!",
      body: (p: GoalReminderParams) => {
        const percent = Math.floor((p.currentAmount / p.targetAmount) * 100);
        return `เป้าหมาย "${p.goalName}" ของคุณคืบหน้าไป ${percent}% แล้วนะ ออมอีกนิดใกล้ถึงฝันแล้วครับ!`;
      },
    },
    en: {
      title: "Goal Check-in!",
      body: (p: GoalReminderParams) => {
        const percent = Math.floor((p.currentAmount / p.targetAmount) * 100);
        return `Your goal "${p.goalName}" is ${percent}% complete. Keep going, you're getting closer!`;
      },
    },
  },
} as const;
