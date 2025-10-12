import PageWrapper from '../../components/PageWrapper';
import FloatingBubble from '../../components/user/FloatingBubble';
import MonthHeader from '../../components/user/MonthHeader';
import incomeIcon from "../../../public/SATISATANG.svg";
import expenseIcon from "../../../public/SATISATANG.svg";
import { PiChartPieSliceLight } from "react-icons/pi";

const mockTransactions = [
  // กันยายน
  {
    id: 1,
    type: "income",
    description: "รายรับจากเซเว่น",
    amount: 1500,
    createdAt: "2025-09-14T10:30:00Z",
  },
  {
    id: 2,
    type: "expense",
    description: "ชาเขียวอิชิตัน",
    amount: 40,
    createdAt: "2025-09-14T15:00:00Z",
  },
  {
    id: 3,
    type: "expense",
    description: "นายสุภเชต อิ่มบุญ",
    amount: 190,
    createdAt: "2025-09-12T18:00:00Z",
  },
  // ตุลาคม
  {
    id: 4,
    type: "income",
    description: "",
    amount: 2000,
    createdAt: "2025-10-07T09:00:00Z",
  },
  {
    id: 5,
    type: "expense",
    description: "ค่าข้าวกลางวัน",
    amount: 60,
    createdAt: "2025-10-10T12:00:00Z",
  },
  {
    id: 6,
    type: "expense",
    description: "",
    amount: 100,
    createdAt: "2025-10-12T11:00:00Z",
  },
];

const Home = () => {

  const handleBubbleClick = () => {
    alert("เปิดแชท!");
  };

  // 🧮 แสดงรายจ่ายรวมทุกเดือน (mock)
  const totalExpense = mockTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // 📅 เลือกเดือน (mock: กันยายน)
  const selectedMonth = 9;

  // 📂 กรองข้อมูลตามเดือนที่เลือก
  const filtered = mockTransactions.filter(
    (t) => new Date(t.createdAt).getMonth() + 1 === selectedMonth
  );

  // 🗂️ จัดกลุ่มตามวันที่
  const groupedByDate = filtered.reduce((acc: any, t) => {
    const dateKey = new Date(t.createdAt).getDate();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(t);
    return acc;
  }, {});

  // 📆 เรียงวันที่ล่าสุดก่อน
  const sortedDates = Object.keys(groupedByDate)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <PageWrapper animation="fade" duration={1.5}>
      <div className="px-6 py-4 font-ibm text-black-900">

        {/* เลือกเดือน */}
        <MonthHeader />

        {/* ยอดใช้จ่าย */}
        <div className="text-center mb-6">
          <p className="text-sm mb-4">ยอดใช้จ่าย</p>
          <h1 className="text-[96px] mb-2 font-semibold leading-none">
            {totalExpense.toLocaleString()}
          </h1>

          {/* ปุ่มดูสรุป */}
          <button
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-black-50 font-semibold text-[14px] rounded-[100px] w-[121px] h-[40px] transform transition-transform duration-200 ease-in-out hover:scale-105 mx-auto"
          >
            <PiChartPieSliceLight className="text-base" />
            ดูสรุป
          </button>
        </div>

        {/* รายการรายรับและรายจ่าย */}
        <div className="space-y-4">
          {sortedDates.length === 0 ? (
            <p className="text-center text-gray-500 text-sm">
              ไม่มีรายการในเดือนนี้
            </p>
          ) : (
            sortedDates.map((day) => {
              const items = groupedByDate[day];
              if (!items || items.length === 0) return null;

              const hasIncome = items.some((t: any) => t.type === "income");
              const totalExpense = items
                .filter((t: any) => t.type === "expense")
                .reduce((sum: number, t: any) => sum + t.amount, 0);
              const totalIncome = items
                .filter((t: any) => t.type === "income")
                .reduce((sum: number, t: any) => sum + t.amount, 0);

              return (
                <div key={day} className="flex gap-2">
                  {/* วันที่ */}
                  <div className="w-[50px] text-center text-sm font-medium text-black-900">
                    {day}
                  </div>

                  {/* รายรับรายจ่าย + รายการ */}
                  <div className="flex-1">
                    {/* บล็อครวมรายรับรายจ่าย */}
                    <div className="flex justify-between bg-blue-50 text-sm font-medium text-black-900 px-4 py-2">
                      {hasIncome ? (
                        <>
                          <div className="flex flex-col items-start">
                            <span className="text-[16px] font-semibold">รายรับ</span>
                            <span className="text-blue-600 text-[16px]">
                              {totalIncome.toLocaleString()}
                            </span>
                          </div>
                          <div className="border-l border-gray-400 mx-4"></div>
                          <div className="flex flex-col items-end">
                            <span className="text-[16px] font-semibold">รายจ่าย</span>
                            <span className="text-[16px]">{totalExpense.toLocaleString()}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <span>รายจ่าย</span>
                          <span>{totalExpense.toLocaleString()}</span>
                        </>
                      )}
                    </div>

                    {/* บล็อครายการ */}
                    <div className="bg-blue-100 text-sm text-black-900 px-4 py-2 border border-gray-300 border-t-0">
                      {items.map((t: any) => (
                        <div
                          key={t.id}
                          className="flex justify-between items-center py-1"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={t.type === "income" ? incomeIcon : expenseIcon}
                              alt={t.type}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <div className="flex flex-col">
                              <span>
                                {t.type === "income" ? "รายรับ" : "รายจ่าย"}
                              </span>
                              {t.description && (
                                <span className="text-gray-700 text-xs">
                                  {t.description}
                                </span>
                              )}
                            </div>
                          </div>
                          <span
                            className={
                              t.type === "income"
                                ? "text-purple-700 font-medium"
                                : ""
                            }
                          >
                            {t.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <FloatingBubble onClick={handleBubbleClick} />
    </PageWrapper>
  );
};

export default Home;
