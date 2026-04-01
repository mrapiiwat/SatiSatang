import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { showToastAlert } from '../store/toastStore';
import useAuthStore from '../store/authStore';
import { type ConsentInterceptorProps } from '../interface/components';
import { consentSteps as steps } from '../constants/consentSteps';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';

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
      <div className="min-h-screen flex items-center justify-center bg-[#ECF4FB]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border border-gray-200" />
            <div className="absolute inset-0 rounded-full border border-t-[#6200EA] animate-spin" />
          </div>
          <p className="text-xs font-medium text-gray-500">{t('loading', 'กำลังโหลด...')}</p>
        </div>
      </div>
    );
  }

  const current = steps[step - 1];
  const isLastStep = step === steps.length;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 relative">
      <div className="absolute top-6">
        <Logo />
      </div>

      <div className="w-full max-w-[390px] h-[640px] bg-white rounded-3xl p-8 shadow-[0_12px_40px_rgba(0,0,0,0.12)] text-left flex flex-col">
        <div className="flex items-center justify-start gap-3 mb-6">
          {steps.map((s, idx) => {
            const isActiveOrPast = step >= s.id;
            return (
              <React.Fragment key={s.id}>
                <div
                  className={`w-[26px] h-[26px] rounded-full flex flex-shrink-0 items-center justify-center text-[11px] transition-colors duration-300 ${
                    isActiveOrPast
                      ? 'bg-[#6200EA] text-white border border-[#6200EA]'
                      : 'bg-white text-gray-300 border border-gray-200 font-medium'
                  }`}
                >
                  {s.id}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-4 h-[1px] transition-colors duration-300 ${
                      step > s.id ? 'bg-[#6200EA]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <h2 className="text-[22px] font-bold text-slate-800 mb-5">
          {t(`consent_step_${current.id}_badge`, current.badge)}
        </h2>

        <div className="w-full flex-1 flex flex-col overflow-hidden mb-6">
          <div className="w-full h-full bg-white border border-gray-200 rounded-2xl overflow-y-auto px-5 py-5 custom-scrollbar">
            {current.sections.map((sec, i) => (
              <div key={i} className="mb-5 last:mb-0">
                <p className="text-xs font-semibold text-slate-700 mb-1.5 tracking-wide">
                  {t(`consent_step_${current.id}_sec_${i}_label`, sec.label)}
                </p>
                <p className="text-[13px] leading-relaxed text-slate-500 font-light">
                  {t(`consent_step_${current.id}_sec_${i}_text`, sec.text)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {isLastStep && (
          <button
            type="button"
            onClick={() => setChecked(!checked)}
            className="w-full flex items-start gap-3 p-4 mb-6 text-left border border-gray-200 rounded-xl transition-all duration-200 hover:bg-slate-50"
          >
            <div
              className={`mt-0.5 w-[18px] h-[18px] rounded flex-shrink-0 flex items-center justify-center transition-colors border ${
                checked ? 'bg-[#6200EA] border-[#6200EA]' : 'bg-white border-gray-300'
              }`}
            >
              {checked && <CheckIcon />}
            </div>
            <span className="text-[11px] text-slate-600 leading-[1.6]">
              {t('consent_accept_prefix', 'ข้าพเจ้าได้อ่านและยอมรับ')}{' '}
              <strong className="font-semibold text-slate-800">
                {t('consent_terms', 'ข้อตกลงการใช้งาน')}
              </strong>
              ,{' '}
              <strong className="font-semibold text-slate-800">
                {t('consent_privacy', 'นโยบายความเป็นส่วนตัว')}
              </strong>{' '}
              {t('consent_and', 'และ')}{' '}
              <strong className="font-semibold text-slate-800">
                {t('consent_ai', 'ข้อตกลงการใช้ AI')}
              </strong>{' '}
              {t('consent_accept_suffix', 'รวมถึงยินยอมให้ประมวลผลข้อมูลส่วนบุคคล')}
            </span>
          </button>
        )}

        <div className="flex w-full gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={isSubmitting}
              className="flex-1 rounded-2xl border  border-gray-200 bg-white py-3.5 text-[14px] font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50"
            >
              {t('back_btn', 'ย้อนกลับ')}
            </button>
          )}
          <button
            type="button"
            onClick={isLastStep ? handleAccept : () => setStep((s) => s + 1)}
            disabled={isSubmitting || (isLastStep && !checked)}
            className={`flex-[1.5] w-full rounded-2xl py-3.5 text-[14px] font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              isLastStep && !checked
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#6200EA] text-white shadow-sm hover:bg-[#5200C4]'
            }`}
          >
            {isSubmitting ? (
              <div
                className="w-4 h-4 rounded-full border-2 animate-spin"
                style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
              />
            ) : isLastStep ? (
              t('accept_and_start', 'เริ่มใช้งาน')
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
  );
};

export default ConsentInterceptor;
