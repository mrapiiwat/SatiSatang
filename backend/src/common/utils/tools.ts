import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const SATANG_TOOLS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_financial_summary",
      description: "ดึงข้อมูลสรุปภาพรวมการเงิน (รายรับ vs รายจ่าย)",
      parameters: {
        type: "object",
        properties: {
          startDate: { type: "string", description: "YYYY-MM-DD" },
          endDate: { type: "string", description: "YYYY-MM-DD" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_transactions",
      description: "ค้นหาประวัติธุรกรรมเจาะจงด้วย Vector Search",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          startDate: { type: "string" },
          endDate: { type: "string" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_stock_knowledge",
      description: "ค้นหาข้อมูลหุ้น",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate_spending_by_keyword",
      description: "คำนวณยอดเงินรวมของสินค้าตามคีย์เวิร์ดเฉพาะเจาะจง",
      parameters: {
        type: "object",
        properties: {
          keyword: { type: "string" },
          startDate: { type: "string" },
          endDate: { type: "string" },
        },
        required: ["keyword"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_spending_by_category",
      description: "ดูยอดรวมรายจ่ายแยกตามหมวดหมู่ 1 หมวด",
      parameters: {
        type: "object",
        properties: {
          categoryName: { type: "string" },
          startDate: { type: "string" },
          endDate: { type: "string" },
        },
        required: ["categoryName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_category_ranking",
      description: "ดูอันดับหมวดหมู่ที่ใช้เงินเยอะที่สุด (ใช้หาว่าเงินหมดไปกับอะไร)",
      parameters: {
        type: "object",
        properties: {
          startDate: { type: "string" },
          endDate: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_top_expenses",
      description: "ค้นหารายการที่ใช้จ่ายแพงที่สุด สามารถระบุเจาะจงหมวดหมู่ได้",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "จำนวนรายการ (default 5)" },
          categoryName: {
            type: "string",
            description: "ชื่อหมวดหมู่ (Optional) เช่น อาหาร, ช้อปปิ้ง",
          },
          startDate: { type: "string" },
          endDate: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_detailed_transactions",
      description:
        "ดึงรายการประวัติการใช้จ่ายแบบเรียบเรียงเป็นข้อๆ (ใช้เมื่อผู้ใช้ถามว่า 'มีรายการอะไรบ้าง', 'ขอดูหน่อย')",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number" },
          categoryName: { type: "string", description: "ชื่อหมวดหมู่ (Optional)" },
          startDate: { type: "string" },
          endDate: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "compare_monthly_spending",
      description: "ใช้เปรียบเทียบยอดการใช้จ่ายระหว่างเดือนที่ระบุ กับ เดือนก่อนหน้า",
      parameters: {
        type: "object",
        properties: {
          month: {
            type: "number",
            description:
              "เดือนที่ต้องการเปรียบเทียบ (1-12) เช่น 1 คือมกราคม, 2 คือกุมภาพันธ์ (ถ้าไม่ระบุจะใช้เดือนปัจจุบัน)",
          },
          year: {
            type: "number",
            description: "ปี ค.ศ. เช่น 2026 (ถ้าไม่ระบุจะใช้ปีปัจจุบัน)",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_goals_and_budgets",
      description: "ดูข้อมูลเป้าหมายเก็บเงิน (Goals) และงบประมาณ (Budgets) ปัจจุบัน",
      parameters: { type: "object", properties: {} },
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
            description: "ID ของหมวดหมู่ที่ตรงกับรายการที่สุด",
          },
          date: {
            type: "string",
            description:
              "วันที่เกิดรายการ (ISO Format YYYY-MM-DD) คำนวณจากข้อความเช่น 'เมื่อวาน', 'วันจันทร์' โดยอ้างอิงจาก Current Date หากไม่ระบุเวลาเจาะจงให้ใช้วันนี้",
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
  {
    type: "function",
    function: {
      name: "switch_to_satang",
      description:
        "เรียกใช้ Tool นี้เมื่อผู้ใช้ถามคำถามที่ 'นอกเหนือ' จากการจดบันทึก เช่น ขอดูสรุปยอดการใช้จ่าย, ขอดูประวัติย้อนหลัง, ให้วิเคราะห์ข้อมูล, หรือขอคำปรึกษาด้านการลงทุนและการเงิน",
      parameters: {
        type: "object",
        properties: {
          reason: {
            type: "string",
            description:
              "เหตุผลสั้นๆ ว่าทำไมถึงส่งให้พี่สตางค์ เช่น 'ดูสรุปยอด' หรือ 'วิเคราะห์การลงทุน'",
          },
        },
        required: ["reason"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "manage_categories",
      description:
        "ใช้เมื่อ User พูดถึงการเพิ่มหมวดหมู่ใหม่, ลบหมวดหมู่, แก้ไขหมวดหมู่ หรือบ่นว่าหาหมวดหมู่ที่ต้องการไม่เจอ",
      parameters: {
        type: "object",
        properties: {
          intent: {
            type: "string",
            description: "ความต้องการของ user เช่น 'add', 'edit', 'list'",
          },
        },
      },
    },
  },
];

export const SLIP_EXTRACTION_TOOL: ChatCompletionTool = {
  type: "function",
  function: {
    name: "extract_slip_data",
    description: "สกัดข้อมูลการเงินจากข้อความ OCR ของสลิปธนาคารหรือใบเสร็จ",
    parameters: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["INCOME", "EXPENSE"],
          description:
            "ทิศทางของเงิน (INCOME = เงินเข้าบัญชีเรา, EXPENSE = เงินออกจากบัญชีเรา)",
        },
        description: {
          type: "string",
          description: "รายละเอียดรายการ เช่น โอนเงินให้..., จ่ายค่า...",
        },
        amount: {
          type: "number",
          description: "จำนวนเงินที่ทำรายการ",
        },
        toAccount: {
          type: "string",
          description: "ชื่อบัญชีหรือชื่อผู้รับเงิน (ถ้ามี)",
        },
        fromAccount: {
          type: "string",
          description: "ชื่อบัญชีหรือชื่อผู้โอนเงิน (ถ้ามี)",
        },
        categoryId: {
          type: "number",
          description:
            "ID ของหมวดหมู่ที่เหมาะสมที่สุด (อ้างอิงจาก Category List ที่แนบไปใน Prompt)",
        },
        date: {
          type: "string",
          description:
            "วันที่และเวลาที่ทำรายการ (ISO 8601) เช่น 2026-03-05T14:04:00+07:00 " +
            "ห้ามเดาเดือนผิดเด็ดขาด ตรวจสอบตัวย่อเดือนไทยให้ดี",
        },
      },
      required: ["type", "description", "amount"],
    },
  },
};
