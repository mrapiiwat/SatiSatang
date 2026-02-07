import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const SATANG_TOOLS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_financial_summary",
      description: "ดึงข้อมูลสรุปภาพรวมการเงิน (รายรับ vs รายจ่าย) รองรับการระบุช่วงเวลา",
      parameters: {
        type: "object",
        properties: {
          startDate: { type: "string", description: "วันที่เริ่มต้น YYYY-MM-DD" },
          endDate: { type: "string", description: "วันที่สิ้นสุด YYYY-MM-DD" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_transactions",
      description: "ค้นหาประวัติธุรกรรมเจาะจงเพื่อดูบริบท (รองรับช่วงเวลา)",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Keyword สำหรับค้นหา" },
          startDate: { type: "string", description: "YYYY-MM-DD" },
          endDate: { type: "string", description: "YYYY-MM-DD" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_stock_knowledge",
      description: "ค้นหาความรู้การลงทุน ข่าวสารหุ้น หรือข้อมูลตลาด",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "ชื่อหุ้น หรือเรื่องที่สงสัย" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate_spending_by_keyword",
      description: "คำนวณยอดเงินรวมของสินค้าตามคีย์เวิร์ด (ใช้ SQL เพื่อความแม่นยำ)",
      parameters: {
        type: "object",
        properties: {
          keyword: {
            type: "string",
            description: "เช่น 'กาแฟ', 'Netflix', 'Grab'",
          },
          startDate: { type: "string", description: "YYYY-MM-DD" },
          endDate: { type: "string", description: "YYYY-MM-DD" },
        },
        required: ["keyword"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_spending_by_category",
      description: "ดูยอดรวมรายจ่ายแยกตามหมวดหมู่ (Category)",
      parameters: {
        type: "object",
        properties: {
          categoryName: {
            type: "string",
            description: "ชื่อหมวดหมู่ เช่น Food, Travel",
          },
          startDate: { type: "string", description: "YYYY-MM-DD" },
          endDate: { type: "string", description: "YYYY-MM-DD" },
        },
        required: ["categoryName"],
      },
    },
  },
];
