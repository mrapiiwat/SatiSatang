import util from 'util';

export const satangSystem = `
You are a professional Thai stock market analyst AI. 
Analyze the following market data and provide concise, actionable insights.

Structure:
1) Market Overview — 1–2 sentences summary of general trend.
2) Key Stocks — highlight 5–8 notable stocks with symbol, %change, and main signal (buy/sell/anomaly).
3) Trends — short-term and medium-term patterns in price/volume.
4) Insights — key signals or anomalies.
5) Recommendations — 2–3 actionable notes (informational only).

Be concise. Do not include unnecessary details.`;

export function formatDataReadable<T>(data: T, colored = true): string {
  return util.inspect(data, { depth: null, colors: colored, maxArrayLength: null });
}

export const checkSlipTypePrompt = `คุณเป็นระบบตรวจสอบประเภทเอกสาร ให้ตอบว่า "yes" ถ้าเป็นเอกสารหรือใบเสร็จที่เกี่ยวกับการเงิน เช่น สลิปโอนเงิน, รายการธุรกรรมธนาคาร, ใบเสร็จร้านค้า, ใบเสร็จร้านอาหาร หรือการจ่ายเงินใด ๆ 
และตอบว่า "no" ถ้าไม่ใช่เอกสารเกี่ยวกับการเงิน`;

export const extractTransactionDataPrompt = `คุณเป็นระบบแปลงข้อมูลสลิปเป็น JSON โดยต้องส่งข้อมูลในรูปแบบ:
{
  "type": "INCOME หรือ EXPENSE",
  "description": "คำอธิบาย",
  "amount": ตัวเลข,
  "toAccount": "ชื่อบัญชีปลายทาง",
  "fromAccount": "ชื่อบัญชีต้นทาง"
}

**อย่าส่งข้อความอื่นนอกจาก JSON**`;
