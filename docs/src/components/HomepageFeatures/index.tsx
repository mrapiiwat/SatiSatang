import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'สแกนสลิปอัจฉริยะด้วย AI',
    Svg: require('@site/static/img/undraw_key-points_iiic.svg').default,
    description: (
      <>
        บันทึกรายจ่ายได้ทันทีเพียงแค่สแกนรูปสลิปธนาคาร
        ด้วยขุมพลัง AI ที่ดึงข้อมูลได้อย่างแม่นยำ ครบถ้วน ไม่ต้องพิมพ์เอง
      </>
    ),
  },
  {
    title: 'จัดหมวดหมู่อัตโนมัติ',
    Svg: require('@site/static/img/undraw_verify-data_k0y1.svg').default,
    description: (
      <>
        ระบบ AI ช่วยวิเคราะห์และคัดแยกหมวดหมู่การใช้จ่ายของคุณให้อัตโนมัติ
        ช่วยให้คุณเห็นภาพรวมการใช้เงินได้ชัดเจนและง่ายกว่าที่เคย
      </>
    ),
  },
  {
    title: 'ผู้ช่วยการเงินส่วนตัว',
    Svg: require('@site/static/img/undraw_all-the-data_ijgn.svg').default,
    description: (
      <>
        ติดตามความคืบหน้าของงบประมาณและเป้าหมายการออมเงิน
        พร้อมสรุปวิเคราะห์ข้อมูลเชิงลึก เพื่อการวางแผนการเงินที่เหนือระดับ
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
