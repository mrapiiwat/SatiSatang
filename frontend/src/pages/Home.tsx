import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../components/Logo';
import PageWrapper from '../components/PageWrapper';
import GitHub from '../assets/Github.svg';

const Home: React.FC = () => {
  const { t } = useTranslation();
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
            {t(
              'hero_desc',
              'เว็บแอปบันทึกรายรับรายจ่ายส่วนตัว พร้อมผู้ช่วยที่จะมาช่วยบันทึกรายรับรายจ่ายให้แบบง่ายๆ และที่ปรึกษาด้านการลงทุนที่จะช่วยแนะนำการลงทุนให้กับคุณโดยเฉพาะ',
            )}
          </p>

          <p className="max-w-sm text-base font-normal leading-relaxed text-black-900 mb-8">
            {t('hero_sub', 'ยังไม่มีบัญชีหรอ? จะรอช้าทำไมล่ะ สมัครโล้ดด')}
          </p>

          <Link to="/login" className="w-full">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-2xl py-3 rounded-full transition cursor-pointer">
              {t('login_btn', 'เข้าใช้งาน')}
            </button>
          </Link>
        </section>

        <section id="main" className="w-full max-w-md px-6 py-8 text-center">
          <h2 className="w-full text-left text-xl font-semibold mb-2">
            {t('concept_title', 'แนวคิด')}
          </h2>
          <h3 className="w-full text-left text-[40px] font-semibold mb-2 bg-gradient-to-r from-blue-700 via-purple-300 to-green-600 text-transparent bg-clip-text">
            {t('home_concept_sub_quote', '“สติสตางค์”')} <br />
            {t('home_concept_sub1', 'ชื่อนี้ท่านได้แต่ใดมา?')}
          </h3>
          <p
            className="max-w-sm text-left text-sm font-normal leading-relaxed text-black-900 mb-8"
            dangerouslySetInnerHTML={{
              __html: t(
                'home_concept_desc',
                'ชื่อ "สติสตางค์" มาจากการผสมคำกันระหว่าง "สติ" และ "สตางค์" <br /> "สติ" หมายถึง ความมีสติปัญญา การมีความระมัดระวัง <br /> "สตางค์" เป็นหน่วยเงิน <br /> การรวมกันของสองคำนี้จึงสะท้อนถึงแนวคิดของแอปพลิเคชันที่มุ่งเน้นให้ผู้ใช้มีสติในการใช้เงินทุกบาททุกสตางค์นั่นเอง',
              ),
            }}
          />
        </section>

        <section className="w-full max-w-md px-6 pb-10">
          <h3 className="w-full text-left text-[40px] font-semibold mb-2 bg-gradient-to-r from-blue-700 via-purple-300 to-green-600  text-transparent bg-clip-text">
            {t('home_features_title', 'ฟีเจอร์ เริศ เริศ')}
          </h3>

          <ol className="list-decimal list-inside text-left space-y-3 text-sm leading-relaxed text-black-900">
            <li>
              {t(
                'home_feature_1',
                'กดเพิ่มรายรับรายจ่าย พร้อมกับเมนูอัปโหลดสลิป: ผู้ใช้งานกดเพิ่มรายรับ รายจ่าย / แสดงช่องใส่ข้อมูล เป็นรายรับหรือรายจ่าย กรอกจำนวนเงิน กรอกหมวดหมู่ และอัปโหลดสลิปได้',
              )}
            </li>
            <li>
              {t(
                'home_feature_2',
                'กำหนดงบและส่งเป้าหมาย: ผู้ใช้งานสามารถตั้งงบประมาณในแต่ละหมวดหมู่ได้ว่าต้องการใช้ไม่เกินเท่าไร',
              )}
            </li>
            <li>{t('home_feature_3', 'แสดงสถิติ: แสดงรายรับรายจ่ายในแต่ละเดือนหรือแต่ละปี')}</li>
            <li>
              {t(
                'home_feature_4',
                'ถามไถ่เกี่ยวกับรายจ่ายรายวัน: ระบบช่วยแนะนำได้ว่าคุณใช้เงินกับอะไรบ่อย',
              )}
            </li>
            <li>
              {t(
                'home_feature_5',
                'ถามไถ่เกี่ยวกับการวางแผนการเงิน: ระบบช่วยวิเคราะห์รายจ่ายและเสนอแนะแนวทางการออม',
              )}
            </li>
            <li>
              {t(
                'home_feature_6',
                'ถามไถ่เกี่ยวกับการลงทุน: ผู้ใช้สามารถสอบถามแนวทางการลงทุนจากระบบได้โดยตรง',
              )}
            </li>
            <li>
              {t(
                'home_feature_7',
                'ให้คำแนะนำส่วนตัว: AI วิเคราะห์ภาพรวมทางการเงินและแนะนำให้เหมาะสม',
              )}
            </li>
          </ol>
        </section>

        <footer className="w-full bg-black-900 text-white py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start gap-10">
              <div className="flex flex-col items-start">
                <a
                  href="#top"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById('top');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="cursor-pointer mb-4"
                >
                  <div className="flex flex-col gap-10">
                    <img
                      src="/SATASATANG_LOGO_WH_HORIZON_TH.svg"
                      alt="SatiSatang Logo White"
                      className="w-[200px] md:w-[256px] h-auto"
                    />
                    <p className="text-sm text-gray-400 hidden md:block">
                      {t('copyright', '© 2025 สติสตางค์ สงวนลิขสิทธิ์')}
                    </p>
                  </div>
                </a>
              </div>

              <div className="flex flex-col sm:flex-row gap-10 md:gap-20">
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold mb-1 text-gray-200">{t('menu', 'เมนู')}</h4>
                  <Link
                    to="/login"
                    className="text-sm text-gray-400 hover:text-white hover:underline w-max cursor-pointer"
                  >
                    {t('login_btn', 'เข้าใช้งาน')}
                  </Link>
                  <a
                    href="/docs/"
                    className="text-sm text-gray-400 hover:text-white hover:underline w-max cursor-pointer"
                  >
                    {t('documentation', 'คู่มือการใช้งาน')}
                  </a>
                  <a
                    href="#main"
                    className="text-sm text-gray-400 hover:text-white hover:underline w-max cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById('main');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {t('about_us', 'เกี่ยวกับเรา')}
                  </a>
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSfsv-LOdD6K4YYGZvHVSK5nCCeCMz6tbHGYYadrZgssXtHVAw/viewform?pli=1"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {t('evaluation_form', 'แบบประเมิน')}
                  </a>
                </div>

                <div className="flex flex-col gap-3">
                  <h4 className="font-bold mb-1 text-gray-200">
                    {t('legal', 'นโยบายและข้อกำหนด')}
                  </h4>
                  <Link
                    to="/policies/terms-of-use"
                    className="text-sm text-gray-400 hover:text-white hover:underline w-max cursor-pointer"
                  >
                    {t('terms', 'ข้อตกลงการใช้งาน')}
                  </Link>
                  <Link
                    to="/policies/privacy-policy"
                    className="text-sm text-gray-400 hover:text-white hover:underline w-max cursor-pointer"
                  >
                    {t('privacy_policy', 'นโยบายความเป็นส่วนตัว')}
                  </Link>
                </div>

                <div className="flex flex-col gap-3">
                  <h4 className="font-bold mb-1 text-gray-200">{t('social', 'ช่องทางติดตาม')}</h4>
                  <a
                    href="https://github.com/mrapiiwat/SatiSatang"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <img src={GitHub} alt="GitHub Logo" className="w-6 h-6 object-contain" />
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </PageWrapper>
  );
};

export default Home;
