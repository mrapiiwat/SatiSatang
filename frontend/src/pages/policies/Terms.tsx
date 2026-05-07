import { useTranslation } from 'react-i18next';

const Terms = () => {
  const lastUpdated = '27 เมษายน 2569';
  const { t } = useTranslation();

  return (
    <>
      <header className="mb-12 border-b border-gray-100 dark:border-white/10 pb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          ข้อตกลงและเงื่อนไขการใช้บริการ
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          ข้อตกลงและเงื่อนไขการใช้งานเว็บไซต์และแอปพลิเคชัน SatiSatang
        </p>
        <p className="text-sm mt-2 text-gray-400 dark:text-gray-500">
          ปรับปรุงล่าสุดเมื่อ: {lastUpdated}
        </p>
      </header>

      <nav className="mb-16 p-8 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10">
        <h2 className="text-xl font-bold mb-6">สารบัญ (Table of Contents)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 text-base">
          {[
            'บทนำ',
            'ทรัพย์สินทางปัญญา',
            'ข้อมูลและเนื้อหาบนเว็บไซต์',
            'การเชื่อมโยงไปยังเว็บไซต์อื่น',
            'การจำกัดความรับผิดชอบ',
            'การเปลี่ยนแปลงข้อตกลง',
            'กฎหมายที่ใช้บังคับ',
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
          <p className="mb-6 italic text-gray-600 dark:text-gray-400">
            กรุณาอ่านข้อกำหนดและเงื่อนไขต่างๆ ดังต่อไปนี้อย่างละเอียด โดยในการเข้าถึงเว็บไซต์ บริการ
            หรือผลิตภัณฑ์ใดๆ ของเรา ถือว่าท่านตกลงที่จะผูกพันตามข้อกำหนดและเงื่อนไขการใช้บริการนี้
          </p>
        </section>

        <section id="section-1" className="scroll-mt-24">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-bold">
              1
            </span>
            บทนำ
          </h2>
          <div className="pl-12 text-gray-700 dark:text-gray-300 border-l-2 border-gray-100 dark:border-white/5 ml-5">
            <p>
              SatiSatang เป็นผู้ดูแลจัดการเว็บไซต์และแอปพลิเคชันนี้
              โดยมีวัตถุประสงค์เพื่อเป็นเครื่องมือในการจัดการการฝึกงาน การลงเวลาเข้างาน
              และการสื่อสารภายในองค์กร
              การเข้าใช้งานของคุณต้องเป็นไปตามเงื่อนไขที่กำหนดไว้ในเอกสารฉบับนี้
            </p>
          </div>
        </section>

        <section id="section-2" className="scroll-mt-24">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-bold">
              2
            </span>
            ทรัพย์สินทางปัญญา
          </h2>
          <div className="pl-12 text-gray-700 dark:text-gray-300 border-l-2 border-gray-100 dark:border-white/5 ml-5">
            <p>
              ข้อมูล ภาพ ข้อความ เครื่องหมายการค้า และส่วนประกอบอื่นๆ
              ทั้งหมดบนเว็บไซต์นี้เป็นลิขสิทธิ์ของ SatiSatang หรือได้รับอนุญาตอย่างถูกต้อง
              ห้ามมิให้ผู้ใดทำซ้ำ ดัดแปลง หรือเผยแพร่ต่อสาธารณชนโดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร
            </p>
          </div>
        </section>

        <section id="section-3" className="scroll-mt-24">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-bold">
              3
            </span>
            ข้อมูลและเนื้อหาบนเว็บไซต์
          </h2>
          <div className="pl-12 text-gray-700 dark:text-gray-300 border-l-2 border-gray-100 dark:border-white/5 ml-5">
            <p>
              เราพยายามอย่างเต็มที่ในการให้ข้อมูลที่ถูกต้องและเป็นปัจจุบัน อย่างไรก็ตาม SatiSatang
              ขอสงวนสิทธิ์ในการปรับปรุง เปลี่ยนแปลง หรือลบข้อมูลบางส่วนโดยไม่ต้องแจ้งให้ทราบล่วงหน้า
              เพื่อความเหมาะสมและทันสมัยของข้อมูล
            </p>
          </div>
        </section>

        <section id="section-4" className="scroll-mt-24">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-bold">
              4
            </span>
            การเชื่อมโยงไปยังเว็บไซต์อื่น
          </h2>
          <div className="pl-12 text-gray-700 dark:text-gray-300 border-l-2 border-gray-100 dark:border-white/5 ml-5">
            <p>
              เว็บไซต์ของเราอาจมีการเชื่อมต่อไปยังเว็บไซต์ภายนอกเพื่อความสะดวกของผู้ใช้
              เราไม่ขอรับผิดชอบต่อเนื้อหา ความถูกต้อง หรือความปลอดภัยของเว็บไซต์ภายนอกเหล่านั้น
              และความเสียหายใดๆ ที่อาจเกิดขึ้นจากการใช้งานเว็บไซต์ดังกล่าว
            </p>
          </div>
        </section>

        <section id="section-5" className="scroll-mt-24">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-bold">
              5
            </span>
            การจำกัดความรับผิดชอบ
          </h2>
          <div className="pl-12 text-gray-700 dark:text-gray-300 border-l-2 border-gray-100 dark:border-white/5 ml-5">
            <p>
              SatiSatang ไม่รับผิดชอบต่อความเสียหาย ความสูญเสีย
              หรือค่าใช้จ่ายที่เกิดขึ้นจากการเข้าใช้งาน หรือการไม่สามารถเข้าใช้งานระบบได้
              ไม่ว่าจะเป็นความล่าช้า การรับส่งข้อมูลที่ผิดพลาด หรือเหตุขัดข้องทางเทคนิคใดๆ
            </p>
          </div>
        </section>

        <section id="section-6" className="scroll-mt-24">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-bold">
              6
            </span>
            การเปลี่ยนแปลงข้อตกลง
          </h2>
          <div className="pl-12 text-gray-700 dark:text-gray-300 border-l-2 border-gray-100 dark:border-white/5 ml-5">
            <p>
              เราขอสงวนสิทธิ์ในการแก้ไขหรือเปลี่ยนแปลงข้อตกลงนี้ได้ทุกเมื่อ
              การที่คุณยังคงใช้งานเว็บไซต์หรือแอปพลิเคชันต่อไปหลังการเปลี่ยนแปลง
              ถือว่าคุณยอมรับข้อตกลงที่แก้ไขแล้วนั้น
            </p>
          </div>
        </section>

        <section id="section-7" className="scroll-mt-24">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-bold">
              7
            </span>
            กฎหมายที่ใช้บังคับ
          </h2>
          <div className="pl-12 text-gray-700 dark:text-gray-300 border-l-2 border-gray-100 dark:border-white/5 ml-5">
            <p>
              การใช้บริการเว็บไซต์นี้
              หรือการตีความข้อตกลงและเงื่อนไขการใช้บริการนี้ให้เป็นไปตามกฎหมายไทย
            </p>
          </div>
        </section>

        <section id="section-8" className="scroll-mt-24">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-bold">
              8
            </span>
            การติดต่อเรา
          </h2>
          <div className="pl-12 text-gray-700 dark:text-gray-300 border-l-2 border-gray-100 dark:border-white/5 ml-5">
            <p>
              หากท่านมีข้อสงสัยเกี่ยวกับข้อกำหนดและเงื่อนไขการใช้บริการนี้ สามารถติดต่อเราได้ที่:
            </p>
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

export default Terms;
