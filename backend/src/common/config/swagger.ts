import { swagger } from "@elysiajs/swagger";

const swaggerConfig = swagger({
  path: "/api/docs",
  documentation: {
    info: {
      title: "SatiSatang API Documentation",
      version: "1.0.0",
      description: "API สำหรับระบบจัดการการเงิน SatiSatang",
    },
    tags: [
      { name: "AUTH", description: "ระบบจัดการการยืนยันตัวตนและการเข้าสู่ระบบ" },
      { name: "USER", description: "ระบบจัดการข้อมูลผู้ใช้งาน" },
      { name: "ICON", description: "ระบบจัดการข้อมูลไอคอน" },
      { name: "GOAL", description: "ระบบจัดการเป้าหมายทางการเงิน" },
      { name: "CATEGORY", description: "ระบบจัดการหมวดหมู่ธุรกรรม" },
      { name: "BUDGET", description: "ระบบจัดการงบประมาณ" },
      { name: "TRANSACTION", description: "ระบบจัดการรายการธุรกรรมรายรับ-รายจ่าย" },
      { name: "CHAT", description: "ระบบจัดการแชทและข้อความช่วยเหลือ" },
      { name: "CONSENT", description: "ระบบจัดการความยินยอมการใช้งานข้อมูล" },
      { name: "SETTING", description: "ระบบจัดการการตั้งค่าผู้ใช้งาน" },
      { name: "NOTIFICATION", description: "ระบบจัดการการแจ้งเตือน" },
      { name: "STOCK", description: "ระบบจัดการข้อมูลหุ้นและการลงทุน" },
    ],
    components: {
      securitySchemes: {
        JwtAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  scalarConfig: {
    spec: {
      url: "/api/docs/json",
    },
  },
});

export default swaggerConfig;
