import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { showToastAlert } from '../store/toastStore';
import useAuthStore from '../store/authStore';
import { type ConsentInterceptorProps } from '../interface/components';
import { consentSteps as steps } from '../constants/consentSteps';
import { useTranslation } from 'react-i18next';

const CheckIcon = () => (
  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
    <path
      d="M2 5l2.5 2.5L8 3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ConsentInterceptor: React.FC<ConsentInterceptorProps> = ({ children }) => {
  const { t } = useTranslation();
  const isConsentAccepted = useAuthStore((state) => state.isConsentAccepted);
  const actionSetConsent = useAuthStore((state) => state.actionSetConsent);

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(!isConsentAccepted);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isConsentAccepted) return;

    const checkConsentStatus = async () => {
      try {
        const res = await axios.get('/consent/status');
        if (res.data?.hasAcceptedAll) {
          actionSetConsent(true);
        }
      } catch (error) {
        console.error('Failed to check consent status', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkConsentStatus();
  }, [isConsentAccepted, actionSetConsent]);

  const handleAccept = async () => {
    if (!checked) {
      showToastAlert(
        t('consent_check_error', 'กรุณาทำเครื่องหมายเพื่อยืนยันการยอมรับเงื่อนไขทั้งหมด'),
        'error',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('/consent/accept');
      actionSetConsent(true);
      showToastAlert(t('welcome_message', 'ยินดีต้อนรับเข้าสู่ระบบ'), 'success');
    } catch (error) {
      console.error('Failed to record consent', error);
      showToastAlert(
        t('save_consent_error', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง'),
        'error',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isConsentAccepted) return <>{children}</>;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F2]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border border-[#D8D3CB]" />
            <div className="absolute inset-0 rounded-full border border-t-[#1C1917] animate-spin" />
          </div>
          <p className="text-xs tracking-[0.2em] uppercase text-[#A8A29E] font-light">
            {t('loading', 'กำลังโหลด')}
          </p>
        </div>
      </div>
    );
  }

  const current = steps[step - 1];
  const isLastStep = step === steps.length;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
      <div
        className="absolute top-[-10%] right-[-10%] w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(196,181,253,0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute bottom-[-10%] left-[-10%] w-[360px] h-[360px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(147,197,253,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div
        className="relative w-full max-w-[380px] rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow:
            '0 1px 0 0 rgba(255,255,255,0.9) inset, 0 32px 64px -12px rgba(28,25,23,0.12), 0 8px 24px -4px rgba(28,25,23,0.06)',
          border: '1px solid rgba(255,255,255,0.7)',
        }}
      >
        <div className="h-[2px] w-full" style={{ background: '#EDE9E3' }}>
          <div
            className="h-full transition-all duration-700 ease-in-out"
            style={{
              width: `${(step / steps.length) * 100}%`,
              background: 'linear-gradient(90deg, #44403C 0%, #78716C 100%)',
            }}
          />
        </div>

        <div className="px-8 pt-7 pb-7 flex flex-col max-h-[90vh]">
          <div className="flex items-center gap-2 mb-6">
            {steps.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium transition-all duration-400 select-none"
                  style={
                    step >= s.id
                      ? {
                          background: 'linear-gradient(135deg, #1C1917 0%, #44403C 100%)',
                          color: '#fff',
                          boxShadow: '0 2px 8px rgba(28,25,23,0.3)',
                        }
                      : {
                          border: '1.5px solid #D6D3D1',
                          color: '#C2BBAF',
                          background: 'transparent',
                        }
                  }
                >
                  {step > s.id ? <CheckIcon /> : s.id}
                </div>
                {s.id < steps.length && (
                  <div
                    className="w-5 h-px transition-all duration-500"
                    style={{ background: step > s.id ? '#44403C' : '#E7E5E4' }}
                  />
                )}
              </div>
            ))}
            <span
              className="ml-2 text-[10px] tracking-[0.15em] uppercase font-medium truncate"
              style={{ color: '#A8A29E' }}
            >
              {t(`consent_step_${current.id}_badge`, current.badge)}
            </span>
          </div>

          <div className="mb-6">
            <h2
              className="text-[26px] leading-tight tracking-tight font-light"
              style={{ color: '#1C1917' }}
            >
              {t(`consent_step_${current.id}_title_0`, current.title[0])}
            </h2>
            <h2
              className="text-[26px] leading-tight tracking-tight italic"
              style={{
                color: 'transparent',
                background: 'linear-gradient(135deg, #78716C 0%, #A8A29E 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
              }}
            >
              {t(`consent_step_${current.id}_title_1`, current.title[1])}
            </h2>
          </div>

          <div
            className="overflow-y-auto flex-1 mb-6 pr-2 space-y-4 min-h-0 max-h-56"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#D6D3D1 transparent',
            }}
          >
            {current.sections.map((sec, i) => (
              <div
                key={i}
                className="pb-4 last:pb-0"
                style={{
                  borderBottom: i < current.sections.length - 1 ? '1px solid #F5F5F4' : 'none',
                }}
              >
                <p
                  className="text-[9px] font-semibold tracking-[0.22em] uppercase mb-2"
                  style={{ color: '#C2BBAF' }}
                >
                  {t(`consent_step_${current.id}_sec_${i}_label`, sec.label)}
                </p>
                <p className="text-[13px] leading-relaxed font-light" style={{ color: '#78716C' }}>
                  {t(`consent_step_${current.id}_sec_${i}_text`, sec.text)}
                </p>
              </div>
            ))}
          </div>

          {isLastStep && (
            <button
              type="button"
              onClick={() => setChecked((v) => !v)}
              className="w-full flex items-start gap-3 text-left transition-all duration-200 mb-6"
              style={{
                padding: '14px 16px',
                borderRadius: '14px',
                border: checked ? '1.5px solid #44403C' : '1.5px solid #E7E5E4',
                background: checked
                  ? 'linear-gradient(135deg, rgba(28,25,23,0.03) 0%, rgba(68,64,60,0.05) 100%)'
                  : 'rgba(250,250,249,0.6)',
                boxShadow: checked ? '0 0 0 3px rgba(68,64,60,0.06)' : 'none',
              }}
            >
              <div
                className="mt-0.5 w-4 h-4 rounded-md flex-shrink-0 flex items-center justify-center transition-all duration-200"
                style={
                  checked
                    ? {
                        background: 'linear-gradient(135deg, #1C1917 0%, #44403C 100%)',
                        border: '1.5px solid #1C1917',
                        boxShadow: '0 2px 6px rgba(28,25,23,0.25)',
                      }
                    : {
                        border: '1.5px solid #D6D3D1',
                        background: '#fff',
                      }
                }
              >
                {checked && <CheckIcon />}
              </div>
              <span className="text-[12px] leading-relaxed font-light" style={{ color: '#78716C' }}>
                {t('consent_accept_prefix', 'ข้าพเจ้าได้อ่านและยอมรับ')}{' '}
                <strong className="font-medium" style={{ color: '#1C1917' }}>
                  {t('consent_terms', 'ข้อตกลงการใช้งาน')}
                </strong>
                ,{' '}
                <strong className="font-medium" style={{ color: '#1C1917' }}>
                  {t('consent_privacy', 'นโยบายความเป็นส่วนตัว')}
                </strong>{' '}
                {t('consent_and', 'และ')}{' '}
                <strong className="font-medium" style={{ color: '#1C1917' }}>
                  {t('consent_ai', 'ข้อตกลงการใช้ AI')}
                </strong>{' '}
                {t('consent_accept_suffix', 'รวมถึงยินยอมให้ประมวลผลข้อมูลส่วนบุคคล')}
              </span>
            </button>
          )}

          <div className="flex gap-2.5">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                disabled={isSubmitting}
                className="px-5 h-11 rounded-2xl text-[13px] font-light transition-all duration-200 disabled:opacity-40"
                style={{
                  border: '1.5px solid #E7E5E4',
                  color: '#78716C',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#D6D3D1';
                  (e.currentTarget as HTMLButtonElement).style.color = '#44403C';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#E7E5E4';
                  (e.currentTarget as HTMLButtonElement).style.color = '#78716C';
                }}
              >
                {t('back_btn', 'ย้อนกลับ')}
              </button>
            )}
            <button
              type="button"
              onClick={isLastStep ? handleAccept : () => setStep((s) => s + 1)}
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-2xl text-[13px] font-normal tracking-wide transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #1C1917 0%, #292524 100%)',
                color: '#fff',
                boxShadow: '0 4px 16px rgba(28,25,23,0.25), 0 1px 0 rgba(255,255,255,0.08) inset',
                letterSpacing: '0.03em',
              }}
            >
              {isSubmitting ? (
                <>
                  <div
                    className="w-3.5 h-3.5 rounded-full border-2 animate-spin"
                    style={{ borderColor: 'rgba(255,255,255,0.25)', borderTopColor: '#fff' }}
                  />
                  <span>{t('saving', 'กำลังบันทึก...')}</span>
                </>
              ) : isLastStep ? (
                t('accept_and_start', 'ยอมรับและเริ่มใช้งาน')
              ) : (
                t('next_step_with_count', {
                  step,
                  total: steps.length,
                  defaultValue: `ถัดไป (${step}/${steps.length}) →`,
                })
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentInterceptor;
