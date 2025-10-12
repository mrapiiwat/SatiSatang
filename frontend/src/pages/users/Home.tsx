// import useAuthStore from '../../store/authStore';
import PageWrapper from '../../components/PageWrapper';
import FloatingBubble from '../../components/user/FloatingBubble';
import MonthHeader from '../../components/user/MonthHeader';
import { PiChartPieSliceLight } from "react-icons/pi";


const mockTransactions = [
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
];

const Home = () => {

  const handleBubbleClick = () => {
    alert("เปิดแชท!");
  };

  { /* แสดงรายจ่ายทั้งหมด */}
  const totalExpense = mockTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

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
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-black-50 font-semibold text-sm rounded-[100px] w-[121px] h-[40px] transition mx-auto"
          >
            <PiChartPieSliceLight className="text-base" />
            ดูสรุป
          </button>
        </div>

        {/* รายการรายรับและรายจ่าย */}

      </div>

      <FloatingBubble onClick={handleBubbleClick} />
    </PageWrapper>
  );
};

export default Home;
