import { useTranslation } from 'react-i18next';

const Privacy = () => {
  const lastUpdated = '27 เมษายน 2569';
  const { t } = useTranslation();

  return (
    <>
      <header className="mb-12 border-b border-gray-100 dark:border-white/10 pb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          นโยบายความเป็นส่วนตัว
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          นโยบายความเป็นส่วนตัวสำหรับการใช้งานเว็บไซต์และแอปพลิเคชัน SatiSatang
        </p>
        <p className="text-sm mt-2 text-gray-400 dark:text-gray-500">
          ปรับปรุงล่าสุดเมื่อ: {lastUpdated}
        </p>
      </header>

      <nav className="mb-16 p-8 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10">
        <h2 className="text-xl font-bold mb-6">สารบัญ (Table of Contents)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 text-base">
          {[
            'คำนิยาม',
            'ความยินยอมของผู้ใช้งาน',
            'การเชื่อมโยงข้อมูลกับบุคคลที่สาม',
            'การติดตามพฤติกรรม (Cookies)',
            'ข้อมูลส่วนบุคคลที่มีความอ่อนไหว',
            'การส่งหรือโอนข้อมูลไปต่างประเทศ',
            'การแจ้งเตือนเหตุการละเมิด',
            'สิทธิของผู้ใช้งาน (PDPA)',
            'กฎหมายที่ใช้บังคับและข้อพิพาท',
            'การถอนความยินยอมและผลกระทบ',
            'บัญชีผู้ใช้และความปลอดภัย',
            'การรักษาความมั่นคงปลอดภัย',
            'การติดต่อเรา',
          ].map((item, index) => (
            <a
              key={index}
              href={`#section-${index + 1}`}
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
            >
              <span className="text-xs font-mono opacity-50">
                {(index + 1).toString().padStart(2, '0')}
              </span>
              {item}
            </a>
          ))}
        </div>
      </nav>

      <article className="space-y-16 text-lg leading-relaxed">
        <section>
          <p className="mb-6">
            นโยบายความเป็นส่วนตัวฉบับนี้ ซึ่งต่อไปนี้จะเรียกว่า{' '}
            <span className="font-semibold text-blue-600 dark:text-blue-400">“นโยบาย”</span>{' '}
            บังคับใช้กับผู้ใช้งานเว็บไซต์และแอปพลิเคชัน SatiSatang โดยมีรายละเอียดดังต่อไปนี้
          </p>
        </section>

        <section id="section-1" className="scroll-mt-24">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-bold">
              1
            </span>
            คำนิยาม
          </h2>
          <div className="pl-12 space-y-4 text-gray-700 dark:text-gray-300 border-l-2 border-gray-100 dark:border-white/5 ml-5">
            <p>
              <span className="font-semibold text-black-900 dark:text-white">
                (ก) “เว็บไซต์และแอปพลิเคชัน”
              </span>{' '}
              หมายความว่า เว็บไซต์และแอปพลิเคชัน ชื่อว่า SatiSatang
            </p>
            <p>
              <span className="font-semibold text-black-900 dark:text-white">
                (ข) “ผู้ควบคุมข้อมูล”
              </span>{' '}
              หมายความว่า ผู้ให้บริการหรือเจ้าของเว็บไซต์และแอปพลิเคชัน SatiSatang
            </p>
            <p>
              <span className="font-semibold text-black-900 dark:text-white">
                (ค) “ผู้ประมวลผลข้อมูล”
              </span>{' '}
              หมายความว่า บุคคลภายนอกซึ่งประมวลข้อมูลเพื่อประโยชน์หรือในนามของผู้ควบคุมข้อมูล
            </p>
            <p>
              <span className="font-semibold text-black-900 dark:text-white">(ง) “ข้อมูล”</span>{' '}
              หมายความว่า สิ่งที่สื่อความหมายให้รู้เรื่องราวข้อเท็จจริง ข้อมูล หรือสิ่งใดๆ
            </p>
            <p>
              <span className="font-semibold text-black-900 dark:text-white">
                (จ) “ข้อมูลส่วนบุคคล”
              </span>{' '}
              หมายความว่า ข้อมูลเกี่ยวกับบุคคลธรรมดาซึ่งทำให้สามารถระบุตัวของบุคคลนั้นได้
            </p>
          </div>
        </section>

        <section id="section-2" className="scroll-mt-24">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-bold">
              2
            </span>
            ความยินยอมของผู้ใช้งาน
          </h2>
          <div className="pl-12 text-gray-700 dark:text-gray-300 border-l-2 border-gray-100 dark:border-white/5 ml-5">
            <p>
              ในการเข้าใช้งานเว็บไซต์และแอปพลิเคชัน
              ผู้ใช้งานตกลงและให้ความยินยอมเกี่ยวกับการเก็บรวบรวมและใช้ข้อมูลส่วนบุคคล
              เพื่อวัตถุประสงค์ในการให้บริการ การพัฒนาประสบการณ์ผู้ใช้งาน การประชาสัมพันธ์
              และการตลาดที่เกี่ยวข้องกับบริการของ SatiSatang เท่านั้น
            </p>
          </div>
        </section>

        <section id="section-3" className="scroll-mt-24">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-bold">
              3
            </span>
            การเชื่อมโยงข้อมูลกับบุคคลที่สาม
          </h2>
          <div className="pl-12 text-gray-700 dark:text-gray-300 border-l-2 border-gray-100 dark:border-white/5 ml-5">
            <p>
              ผู้ควบคุมข้อมูลอาจมีการเชื่อมโยงข้อมูลของผู้ใช้งานกับผู้ให้บริการบุคคลที่สาม
              เพื่อให้การให้บริการมีประสิทธิภาพ โดยจะแจ้งให้ทราบหากมีการเชื่อมโยงข้อมูลที่สำคัญ
              และดำเนินการตามมาตรฐานความปลอดภัย
            </p>
          </div>
        </section>

        <section id="section-4" className="scroll-mt-24">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-bold">
              4
            </span>
            การติดตามพฤติกรรม (Cookies)
          </h2>
          <div className="pl-12 text-gray-700 dark:text-gray-300 border-l-2 border-gray-100 dark:border-white/5 ml-5">
            <p>
              เราใช้ Cookies เพื่อจดจำการตั้งค่าและวิเคราะห์การใช้งาน เพื่อพัฒนาบริการให้ดียิ่งขึ้น
              คุณสามารถเลือกตั้งค่าการยอมรับหรือปฏิเสธ Cookies ได้ผ่านการตั้งค่าเบราว์เซอร์
            </p>
          </div>
        </section>

        <section id="section-5" className="scroll-mt-24">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-bold">
              5
            </span>
            ข้อมูลส่วนบุคคลที่มีความอ่อนไหว
          </h2>
          <div className="pl-12 text-gray-700 dark:text-gray-300 border-l-2 border-gray-100 dark:border-white/5 ml-5">
            <p>
              ข้อมูลที่มีความอ่อนไหว เช่น เชื้อชาติ ศาสนา ข้อมูลสุขภาพ
              จะถูกเก็บรวบรวมเมื่อจำเป็นและได้รับความยินยอมโดยชัดแจ้งเท่านั้น
              หรือตามที่กฎหมายอนุญาตเพื่อประโยชน์สาธารณะ
            </p>
          </div>
        </section>

        <section id="section-6" className="scroll-mt-24">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-bold">
              6
            </span>
            การส่งหรือโอนข้อมูลไปต่างประเทศ
          </h2>
          <div className="pl-12 text-gray-700 dark:text-gray-300 border-l-2 border-gray-100 dark:border-white/5 ml-5">
            <p>
              เราอาจโอนข้อมูลไปยังระบบ Cloud
              ต่างประเทศที่มีมาตรฐานความปลอดภัยเทียบเท่าหรือสูงกว่ามาตรฐานไทย
              เพื่อความต่อเนื่องในการให้บริการ
            </p>
          </div>
        </section>

        <section id="section-7" className="scroll-mt-24">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-bold">
              7
            </span>
            การแจ้งเตือนเหตุการละเมิด
          </h2>
          <div className="pl-12 text-gray-700 dark:text-gray-300 border-l-2 border-gray-100 dark:border-white/5 ml-5">
            <p>
              หากพบเหตุละเมิดข้อมูลที่ส่งผลกระทบต่อคุณ เราจะแจ้งหน่วยงานกำกับดูแลภายใน 72 ชั่วโมง
              และแจ้งให้คุณทราบหากมีความเสี่ยงสูง
            </p>
          </div>
        </section>

        <section id="section-8" className="scroll-mt-24">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-bold">
              8
            </span>
            สิทธิของผู้ใช้งาน (PDPA)
          </h2>
          <div className="pl-12 text-gray-700 dark:text-gray-300 border-l-2 border-gray-100 dark:border-white/5 ml-5 space-y-4">
            <p>
              คุณมีสิทธิในการขอเข้าถึง, แก้ไข, ลบ, ระงับใช้,
              หรือถอนความยินยอมข้อมูลส่วนบุคคลของคุณได้ตลอดเวลา ผ่านช่องทางการติดต่อที่เรากำหนด
            </p>
          </div>
        </section>

        <section id="section-9" className="scroll-mt-24">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-bold">
              9
            </span>
            กฎหมายที่ใช้บังคับและข้อพิพาท
          </h2>
          <div className="pl-12 text-gray-700 dark:text-gray-300 border-l-2 border-gray-100 dark:border-white/5 ml-5">
            <p>นโยบายนี้อยู่ภายใต้กฎหมายไทย หากมีข้อพิพาทให้เสนอต่อศาลไทยที่มีเขตอำนาจ</p>
          </div>
        </section>

        <section id="section-10" className="scroll-mt-24">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-bold">
              10
            </span>
            การถอนความยินยอมและผลกระทบ
          </h2>
          <div className="pl-12 text-gray-700 dark:text-gray-300 border-l-2 border-gray-100 dark:border-white/5 ml-5">
            <p>
              การถอนความยินยอมอาจส่งผลต่อความสามารถในการใช้งานฟีเจอร์บางอย่างของแอปพลิเคชัน
              แต่จะไม่กระทบต่อการประมวลผลที่เคยได้รับความยินยอมไปแล้วโดยชอบด้วยกฎหมาย
            </p>
          </div>
        </section>

        <section id="section-11" className="scroll-mt-24">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-bold">
              11
            </span>
            บัญชีผู้ใช้และความปลอดภัย
          </h2>
          <div className="pl-12 text-gray-700 dark:text-gray-300 border-l-2 border-gray-100 dark:border-white/5 ml-5">
            <p>
              คุณมีหน้าที่รักษาความลับของชื่อผู้ใช้และรหัสผ่าน
              การเข้าถึงโดยบุคคลที่สามที่เกิดจากความประมาทเลินเล่อของผู้ใช้
              จะไม่อยู่ในความรับผิดชอบของระบบ
            </p>
          </div>
        </section>

        <section id="section-12" className="scroll-mt-24">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-bold">
              12
            </span>
            การรักษาความมั่นคงปลอดภัย
          </h2>
          <div className="pl-12 text-gray-700 dark:text-gray-300 border-l-2 border-gray-100 dark:border-white/5 ml-5">
            <p>เราใช้การเข้ารหัส SSL/TLS และระบบ Firewall ชั้นสูงเพื่อป้องกันข้อมูลของคุณ</p>
          </div>
        </section>

        <section id="section-13" className="scroll-mt-24">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-bold">
              13
            </span>
            การติดต่อเรา
          </h2>
          <div className="pl-10 text-gray-700 dark:text-gray-300">
            <p>หากคุณมีคำถามหรือข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ สามารถติดต่อเราได้ที่:</p>
            <div className="mt-4 p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
              <p className="font-semibold mb-2 text-black-900 dark:text-white text-xl">
                SatiSatang Team
              </p>
              <p>
                อีเมล:{' '}
                <a
                  href="mailto:support@satisatang.com"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  satisatang.contact@gmail.com
                </a>
              </p>
              <p>
                เว็บไซต์:{' '}
                <a
                  href="https://satisatang.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  www.สติสตางค์.com
                </a>
              </p>
            </div>
          </div>
        </section>
      </article>

      <footer className="mt-20 pt-10 border-t border-gray-100 dark:border-white/10 text-center text-gray-400 text-sm">
        <p>{t('copyright', '© 2025 สติสตางค์ สงวนลิขสิทธิ์')}</p>
      </footer>
    </>
  );
};

export default Privacy;
