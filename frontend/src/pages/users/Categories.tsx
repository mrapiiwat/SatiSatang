import React, { useState, useRef, useEffect } from "react";
import { AiOutlinePlus } from "react-icons/ai";

const Categories = () => {
  const [selectedType, setSelectedType] = useState<"income" | "expense">("income");

  const incomeRef = useRef<HTMLButtonElement>(null);
  const expenseRef = useRef<HTMLButtonElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);

  const incomeCategories = ["เงินเดือน", "ค่าจ้าง", "เพื่อนให้", "ค้าขาย,ธุรกิจ", "พ่อแม่ให้", "อื่นๆ"];
  const expenseCategories = ["อาหาร", "เดินทาง", "ความบันเทิง", "บิล", "ซื้อของ", "อื่นๆ"];

  const currentCategories =
    selectedType === "income" ? incomeCategories : expenseCategories;

  // ทำให้ขีดเส้นใต้ขยับอัตโนมัติให้ตรงกับปุ่มที่เลือก
  useEffect(() => {
    const currentButton =
      selectedType === "income" ? incomeRef.current : expenseRef.current;
    const underline = underlineRef.current;

    if (currentButton && underline) {
      const rect = currentButton.getBoundingClientRect();
      const parentRect = currentButton.parentElement!.getBoundingClientRect();

      underline.style.width = `${rect.width}px`;
      underline.style.left = `${rect.left - parentRect.left}px`;
    }
  }, [selectedType]);

  return (
    <div className="px-6 py-8 text-black-900">

      {/* ปุ่มเลือกประเภท */}
      <div className="relative flex justify-center gap-8 mb-8">
        {/* เส้น underline */}
        <div
          ref={underlineRef}
          className="absolute bottom-0 h-[2px] bg-black-900 transition-all duration-300 ease-in-out"
        ></div>

        {/* ปุ่มรายรับ */}
        <button
          ref={incomeRef}
          onClick={() => setSelectedType("income")}
          className={`pb-1 text-base transition-colors ${
            selectedType === "income"
              ? "font-semibold text-black-900"
              : "text-gray-400"
          }`}
        >
          รายรับ
        </button>

        {/* ปุ่มรายจ่าย */}
        <button
          ref={expenseRef}
          onClick={() => setSelectedType("expense")}
          className={`pb-1 text-base transition-colors ${
            selectedType === "expense"
              ? "font-semibold text-black-900"
              : "text-gray-400"
          }`}
        >
          รายจ่าย
        </button>
      </div>

      {/* แสดงหมวดหมู่ */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-6 gap-x-4 justify-items-center transition-opacity duration-300">
        {currentCategories.map((cat, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-black-900 rounded-full"></div>
            <span className="text-sm text-center">{cat}</span>
          </div>
        ))}

        {/* ปุ่มเพิ่มหมวดหมู่ */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-purple-600 text-2xl font-semibold cursor-pointer hover:scale-110 transition-transform">
            <AiOutlinePlus />
          </div>
          <span className="text-sm text-center text-gray-700">เพิ่มหมวดหมู่</span>
        </div>
      </div>
    </div>
  );
};

export default Categories;
