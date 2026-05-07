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
  {
    type: "function",
    function: {
      name: "switch_to_sati",
      description:
        "เรียกใช้ Tool นี้เมื่อผู้ใช้ต้องการ 'บันทึกรายรับรายจ่าย', 'ตั้งเป้าหมาย (Goal)', หรือ 'ตั้งงบประมาณ (Budget)' เนื่องจากสตางค์มีหน้าที่แค่วิเคราะห์ ไม่สามารถบันทึกข้อมูลได้",
      parameters: {
        type: "object",
        properties: {
          reason: {
            type: "string",
            description:
              "เหตุผลสั้นๆ ว่าทำไมถึงส่งให้น้องสติ เช่น 'ต้องการบันทึกรายจ่าย' หรือ 'ตั้งงบ'",
          },
        },
        required: ["reason"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_goals_and_budgets",
      description:
        "ดูข้อมูลเป้าหมายเก็บเงิน (Goals) และงบประมาณ (Budgets) ปัจจุบัน (บังคับเรียกใช้ Tool นี้เสมอเมื่อผู้ใช้ถามว่า 'มีเป้าหมายอะไรบ้าง', 'ตั้งเป้าอะไรไว้', หรือ 'เหลืองบเท่าไหร่')",
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
          is_force_confirm: {
            type: "boolean",
            description:
              "ส่งค่า true เมื่อผู้ใช้ยืนยันที่จะทำรายการต่อ แม้ว่าจะได้รับการแจ้งเตือนเรื่องงบประมาณเกินไปแล้ว (ดูจากประวัติการคุยล่าสุด)",
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
      description:
        "ใช้เมื่อ User ต้องการ สร้าง, เพิ่ม, หรือตั้ง 'เป้าหมาย' (Goal) ในการออมเงิน (ห้ามสับสนกับหมวดหมู่)",
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
        "ใช้เมื่อ User พูดถึงการจัดการ 'หมวดหมู่' (Category) เท่านั้น เช่น เพิ่มหมวดหมู่ใหม่, ลบ, แก้ไข (คำเตือน: ห้ามใช้ Tool นี้ถ้าผู้ใช้พูดถึง 'เป้าหมาย' หรือ Goal เด็ดขาด)",
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
    description: "สกัดข้อมูลการเงินจากสลิปธนาคาร",
    parameters: {
      type: "object",
      properties: {
        reasoning: {
          type: "string",
          description:
            "อธิบายสิ่งที่คุณเห็นบนสลิปทีละขั้นตอน เช่น 'คำว่า จาก คือใคร', 'คำว่า ไปยัง คือใคร' เพื่อป้องกันการสลับกัน",
        },
        type: {
          type: "string",
          enum: ["INCOME", "EXPENSE"],
          description: "ทิศทางของเงิน",
        },
        description: {
          type: "string",
          description: "รายละเอียดรายการ",
        },
        amount: {
          type: "number",
          description: "จำนวนเงินที่ทำรายการ",
        },
        toAccount: {
          type: "string",
          description: "ผู้รับเงิน / ปลายทาง (วิเคราะห์จาก reasoning)",
        },
        fromAccount: {
          type: "string",
          description: "ผู้โอนเงิน / ต้นทาง (วิเคราะห์จาก reasoning)",
        },
        categoryId: {
          type: "number",
        },
        date: {
          type: "string",
        },
      },
      required: [
        "reasoning",
        "type",
        "description",
        "amount",
        "date",
        "categoryId",
        "toAccount",
        "fromAccount",
      ],
    },
  },
};
