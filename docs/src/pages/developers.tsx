import type { ReactNode } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';

export default function Developers(): ReactNode {
  return (
    <Layout title="รายชื่อผู้จัดทำ" description="ทีมพัฒนาสติสตางค์" wrapperClassName="developers-page-active">
      <div className="developers-page">

        <h1 className="developers-title">รายชื่อผู้จัดทำ</h1>

        <p className="developers-subtitle">
          จัดทำคู่มือการใช้งานสติสตางค์ (SatiSatang) เพื่อเป็นแนวทางปฏิบัติและการใช้งานระบบจัดการรายรับ-รายจ่าย โดยรวบรวมทุกฟังก์ชันสำคัญและการใช้งานต่าง ๆ ไว้อย่างครบถ้วน เพื่อให้ผู้ใช้สามารถใช้งานได้อย่างราบรื่น
        </p>

        <div className="developers-grid">

          <div className="dev-member-card">
            <div className="dev-avatar-container">
              <img src={useBaseUrl('/img/member/rif.JPG')} alt="นายอภิวัฒน์ ลานทอง" className="dev-avatar-img" />
            </div>
            <div className="dev-name">นายอภิวัฒน์ ลานทอง</div>
            <div className="dev-details">
              <div className="dev-detail-item">
                <span className="dev-label">ตำแหน่ง:</span> Full Stack Developer
              </div>
              <div className="dev-detail-item">
                <span className="dev-label">หน้าที่:</span> พัฒนา Frontend และ Backend API
              </div>
            </div>
          </div>

          <div className="dev-member-card">
            <div className="dev-avatar-container">
              <img src={useBaseUrl('/img/member/kuytiew.JPG')} alt="นายภูมิพัฒน์ เวฬุฬฐ์วรรณราช" className="dev-avatar-img" />
            </div>
            <div className="dev-name">นายภูมิพัฒน์ เวฬุฬฐ์วรรณราช</div>
            <div className="dev-details">
              <div className="dev-detail-item">
                <span className="dev-label">ตำแหน่ง:</span> Full Stack Developer
              </div>
              <div className="dev-detail-item">
                <span className="dev-label">หน้าที่:</span> พัฒนาระบบฐานข้อมูลและ API integration
              </div>
            </div>
          </div>

        </div>

      </div>
    </Layout>
  );
}
