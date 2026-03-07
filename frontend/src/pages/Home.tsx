import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import PageWrapper from '../components/PageWrapper';
import GitHub from '../assets/Github.svg';

const Home: React.FC = () => {
  return (
    <PageWrapper animation="flip">
      <div
        id="top"
        className="font-ibm text-gray-900 flex flex-col items-center min-h-screen bg-white"
      >
        <div className="mt-6 mb-6">
          <Logo />
        </div>

        <section className="flex flex-col items-center text-center px-6 py-10">
          <img
            src="/SATASATANG_LOGO_BLACK_VERTICAL_TH.svg"
            alt="SatiSatang Logo with App Name"
            className="w-[194px] h-auto mb-8"
          />

          <p className="max-w-sm text-xl font-semibold leading-relaxed text-black-900 mb-8">
            เว็บแอปบันทึกรายรับรายจ่ายส่วนตัว พร้อมผู้ช่วยที่จะมาช่วยบันทึกรายรับรายจ่ายให้แบบง่ายๆ
            และที่ปรึกษาด้านการลงทุนที่จะช่วยแนะนำการลงทุนให้กับคุณโดยเฉพาะ
          </p>

          <p className="max-w-sm text-base font-normal leading-relaxed text-black-900 mb-8">
            ยังไม่มีบัญชีหรอ? จะรอช้าทำไมล่ะ สมัครโล้ดด
          </p>

          <Link to="/login" className="w-full">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-2xl py-3 rounded-full transition cursor-pointer">
              เข้าใช้งาน
            </button>
          </Link>
        </section>

        <section id="main" className="w-full max-w-md px-6 py-8 text-center">
          <h2 className="w-full text-left text-xl font-semibold mb-2">แนวคิด</h2>
          <h3 className="w-full text-left text-[40px] font-semibold mb-2 bg-gradient-to-r from-blue-700 via-purple-300 to-green-600 text-transparent bg-clip-text">
            “สติสตางค์” <br />
            ชื่อนี้ท่านได้แต่ใดมา?
          </h3>
          <p className="max-w-sm text-left text-sm font-normal leading-relaxed text-black-900 mb-8">
            ชื่อ "สติสตางค์" มาจากการผสมคำกันระหว่าง "สติ" และ "สตางค์" <br />
            "สติ" หมายถึง ความมีสติปัญญา การมีความระมัดระวัง <br />
            "สตางค์" เป็นหน่วยเงิน <br />
            การรวมกันของสองคำนี้จึงสะท้อนถึงแนวคิดของแอปพลิเคชันที่มุ่งเน้นให้ผู้ใช้มีสติในการใช้เงินทุกบาททุกสตางค์นั่นเอง
          </p>
        </section>

        <section className="w-full max-w-md px-6 pb-10">
          <h3 className="w-full text-left text-[40px] font-semibold mb-2 bg-gradient-to-r from-blue-700 via-purple-300 to-green-600  text-transparent bg-clip-text">
            ฟีเจอร์ เริศ เริศ
          </h3>

          <ol className="list-decimal list-inside text-left space-y-3 text-sm leading-relaxed text-black-900">
            <li>
              กดเพิ่มรายรับรายจ่าย พร้อมกับเมนูอัปโหลดสลิป: ผู้ใช้งานกดเพิ่มรายรับ รายจ่าย /
              แสดงช่องใส่ข้อมูล เป็นรายรับหรือรายจ่าย กรอกจำนวนเงิน กรอกหมวดหมู่ และอัปโหลดสลิปได้
            </li>
            <li>
              กำหนดงบและส่งเป้าหมาย:
              ผู้ใช้งานสามารถตั้งงบประมาณในแต่ละหมวดหมู่ได้ว่าต้องการใช้ไม่เกินเท่าไร
            </li>
            <li>แสดงสถิติ: แสดงรายรับรายจ่ายในแต่ละเดือนหรือแต่ละปี</li>
            <li>ถามไถ่เกี่ยวกับรายจ่ายรายวัน: ระบบช่วยแนะนำได้ว่าคุณใช้เงินกับอะไรบ่อย</li>
            <li>ถามไถ่เกี่ยวกับการวางแผนการเงิน: ระบบช่วยวิเคราะห์รายจ่ายและเสนอแนะแนวทางการออม</li>
            <li>ถามไถ่เกี่ยวกับการลงทุน: ผู้ใช้สามารถสอบถามแนวทางการลงทุนจากระบบได้โดยตรง</li>
            <li>ให้คำแนะนำส่วนตัว: AI วิเคราะห์ภาพรวมทางการเงินและแนะนำให้เหมาะสม</li>
          </ol>
        </section>

        <footer className="w-full bg-black-900 text-white py-8 px-6 ">
          <div className="max-w-6xl mx-auto flex flex-col justify-between min-h-[220px]">
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('top');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex flex-col items-start w-max cursor-pointer"
            >
              <img
                src="/SATASATANG_LOGO_WH_HORIZON_TH.svg"
                alt="SatiSatang Logo White"
                className="w-[256px] h-auto mb-6"
              />
            </a>

            <div className="flex flex-col gap-4 text-sm leading-relaxed mb-6">
              <Link to="/login" className="hover:underline w-max cursor-pointer">
                เข้าใช้งาน
              </Link>
              <a
                href="#main"
                className="hover:underline w-max cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById('main');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                เกี่ยวกับเรา
              </a>
            </div>

            <a href="https://github.com/mrapiiwat/SatiSatang" className="flex flex-col items-start">
              <img src={GitHub} alt="GitHub Logo" className="w-[32px] h-[32px] object-contain" />
            </a>

            <p className="text-sm text-gray-300 mt-6">© 2025 สติสตางค์ สงวนลิขสิทธิ์</p>
          </div>
        </footer>
      </div>
    </PageWrapper>
  );
};

export default Home;
