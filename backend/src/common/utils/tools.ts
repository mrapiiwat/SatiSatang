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

export const SATI_TOOLS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "create_transaction",
      description: "ใช้เมื่อ User ต้องการบันทึกรายรับหรือรายจ่าย",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["INCOME", "EXPENSE"],
            description: "EXPENSE = รายจ่าย, INCOME = รายรับ",
          },
          amount: { type: "number", description: "จำนวนเงิน (ไม่ต้องติดลบ)" },
          description: { type: "string", description: "รายละเอียดรายการ" },
          categoryId: {
            type: "number",
            description: "ID ของหมวดหมู่ที่ตรงกับรายการที่สุด (จาก List ที่ให้ไป)",
          },
        },
        required: ["type", "amount"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_budget",
      description: "ใช้เมื่อ User ต้องการตั้งงบประมาณ",
      parameters: {
        type: "object",
        properties: {
          amount: { type: "number" },
          categoryId: {
            type: "number",
            description: "Category ID ที่ต้องการตั้งงบ",
          },
          frequency: {
            type: "string",
            enum: ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
            description: "ความถี่ของงบประมาณ",
          },
        },
        required: ["amount", "frequency"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_goal",
      description: "ใช้เมื่อ User ต้องการตั้งเป้าหมายออมเงิน",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "ชื่อเป้าหมาย" },
          amount: { type: "number", description: "จำนวนเงินเป้าหมาย" },
          deadline: {
            type: "string",
            description: "วันที่ครบกำหนด (ISO Date YYYY-MM-DD)",
          },
        },
        required: ["name", "amount"],
      },
    },
  },
];
