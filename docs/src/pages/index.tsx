import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title" style={{ fontSize: '3.5rem' }}>
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle" style={{ fontSize: '1.5rem', opacity: 0.9 }}>
          คู่มือที่จะช่วยให้คุณบันทึกและจัดการการเงินได้อย่างง่ายดายและมีประสิทธิภาพ
        </p>
        <div className={styles.buttons}>
          <a
            className={clsx('button button--lg', styles.heroButtonPrimary)}
            href="/">
            เริ่มใช้งาน สติสตางค์
          </a>
          <Link
            className={clsx('button button--lg', styles.heroButtonSecondary)}
            to="/category/ภาพรวมวิธีการใช้งานระบบ">
            คู่มือวิธีการใช้งาน
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="คู่มือการใช้งานระบบสติสตางค์ บันทึกรายรับ-รายจ่าย ง่ายๆ ด้วย AI">
      <div className={styles.mainContainer}>
        <HomepageHeader />
        <main className={styles.featuresSection}>
          <HomepageFeatures />
        </main>
      </div>
    </Layout>
  );
}
