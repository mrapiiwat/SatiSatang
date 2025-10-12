import React, { useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const MonthHeader = () => {
  const currentDate = new Date("2025-10-12"); // mock วันนี้
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

  const monthsThai = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
  ];

  const isCurrentMonth =
    currentMonth === currentDate.getMonth() &&
    currentYear === currentDate.getFullYear();

  const handlePrev = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNext = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleCalendarClick = () => {
    alert("เปิดปฏิทินเลือกเดือนและปี");
  };

  return (
    <div className="flex items-center justify-center mb-8">
      {/* กล่องกลางทั้งหมด (ลูกศร + ปุ่มเดือน) */}
      <div className="flex items-center justify-center gap-2">
        {/* ลูกศรซ้าย */}
        <button
          onClick={handlePrev}
          className="text-black-900 text-2xl hover:opacity-70 transition"
          aria-label="previous month"
        >
          <IoIosArrowBack />
        </button>

        {/* ปุ่มเดือน */}
        <button
          onClick={handleCalendarClick}
          className="border border-black-900 rounded-[8px] px-4 py-1 text-sm font-semibold text-black-900"
        >
          {monthsThai[currentMonth]} {currentYear + 543 - 2500}
        </button>

        {/* ลูกศรขวา (มีเฉพาะถ้าไม่ใช่เดือนปัจจุบัน) */}
        {!isCurrentMonth ? (
          <button
            onClick={handleNext}
            className="text-black-900 text-2xl hover:opacity-70 transition"
            aria-label="next month"
          >
            <IoIosArrowForward />
          </button>
        ) : (
          // ถ้าเป็นเดือนปัจจุบัน → จองที่ไว้ให้ layout ไม่ขยับ
          <div className="w-[24px] h-[24px]" />
        )}
      </div>
    </div>
  );
};

export default MonthHeader;
