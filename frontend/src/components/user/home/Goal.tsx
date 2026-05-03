import React, { useState, useMemo, useEffect } from 'react';
import { RxCross2 } from 'react-icons/rx';
import Select, { type StylesConfig, type SingleValue } from 'react-select';
import type { OptionType, GoalDraftData, GoalProps } from '../../../interface/home';
import axios from '../../../api/axios';
import { AxiosError, isAxiosError } from 'axios';
import { showToastAlert } from '../../../store/toastStore';
import type { ElysiaResponse } from '../../../interface/error';
import Tooltip from '../../Tooltip';
import DeleteModal from '../../DeleteModal';
import { useTranslation } from 'react-i18next';

const Goal: React.FC<GoalProps> = ({ onClose, onSuccess, editData, onUpdateDraft }) => {
  const { t } = useTranslation();
  const [goalName, setGoalName] = useState('');
  const [amount, setAmount] = useState('');
  const [hasDeadline, setHasDeadline] = useState(false);
  const [year, setYear] = useState<SingleValue<OptionType>>(null);
  const [month, setMonth] = useState<SingleValue<OptionType>>(null);
  const [day, setDay] = useState<SingleValue<OptionType>>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentYear = new Date().getFullYear();

  const yearOptions: OptionType[] = useMemo(() => {
    return Array.from({ length: 11 }, (_, i) => {
      const val = currentYear + i;
      return { value: String(val), label: String(val) };
    });
  }, [currentYear]);

  const monthOptions: OptionType[] = useMemo(
    () => [
      { value: '1', label: t('month_jan', 'มกราคม') },
      { value: '2', label: t('month_feb', 'กุมภาพันธ์') },
      { value: '3', label: t('month_mar', 'มีนาคม') },
      { value: '4', label: t('month_apr', 'เมษายน') },
      { value: '5', label: t('month_may', 'พฤษภาคม') },
      { value: '6', label: t('month_jun', 'มิถุนายน') },
      { value: '7', label: t('month_jul', 'กรกฎาคม') },
      { value: '8', label: t('month_aug', 'สิงหาคม') },
      { value: '9', label: t('month_sep', 'กันยายน') },
      { value: '10', label: t('month_oct', 'ตุลาคม') },
      { value: '11', label: t('month_nov', 'พฤศจิกายน') },
      { value: '12', label: t('month_dec', 'ธันวาคม') },
    ],
    [t],
  );

  useEffect(() => {
    if (editData) {
      setGoalName(editData.name);
      setAmount(editData.amount.toString());

      if (editData.deadline) {
        setHasDeadline(true);
        const date = new Date(editData.deadline);
        if (!isNaN(date.getTime())) {
          const yVal = date.getFullYear().toString();
          const mVal = (date.getMonth() + 1).toString();
          const dVal = date.getDate().toString();

          setYear(yearOptions.find((o) => o.value === yVal) || null);
          setMonth(monthOptions.find((o) => o.value === mVal) || null);
          setDay({ value: dVal, label: dVal });
        }
      } else {
        setHasDeadline(false);
      }
    }
  }, [editData, yearOptions, monthOptions]);

  const maxDays = useMemo(() => {
    if (!month) return 31;
    const m = Number(month.value);

    if ([4, 6, 9, 11].includes(m)) return 30;
    if (m === 2) {
      if (year) {
        const y = Number(year.value);
        const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
        return isLeap ? 29 : 28;
      }
      return 29;
    }
    return 31;
  }, [month, year]);

  const dayOptions: OptionType[] = useMemo(() => {
    return Array.from({ length: maxDays }, (_, i) => ({
      value: String(i + 1),
      label: String(i + 1),
    }));
  }, [maxDays]);

  const isModified = () => {
    if (!editData) return true;

    const isNameChanged = goalName !== editData.name;
    const isAmountChanged = Number(amount) !== Number(editData.amount);

    if (isNameChanged || isAmountChanged) return true;

    const originalDate = editData.deadline ? new Date(editData.deadline) : null;
    const originalHasDeadline = !!originalDate;

    if (hasDeadline !== originalHasDeadline) return true;

    if (hasDeadline && originalDate) {
      const orgY = originalDate.getFullYear().toString();
      const orgM = (originalDate.getMonth() + 1).toString();
      const orgD = originalDate.getDate().toString();

      const currentY = year?.value;
      const currentM = month?.value;
      const currentD = day?.value;

      if (currentY !== orgY || currentM !== orgM || currentD !== orgD) {
        return true;
      }
    }

    return false;
  };

  const isFormValid = () => {
    if (!goalName.trim()) return false;
    if (!amount || Number(amount) <= 0) return false;

    if (hasDeadline) {
      if (!year || !month || !day) return false;
    }

    return true;
  };

  const canSubmit = isModified() && isFormValid();

  const validateInputs = () => {
    if (!goalName.trim()) {
      showToastAlert(t('error_goal_name_req', 'กรุณากรอกชื่อเป้าหมาย'), 'error');
      return false;
    }
    if (!amount.trim() || parseFloat(amount) <= 0) {
      showToastAlert(t('manual_error_amount_gt_0', 'จำนวนเงินต้องมากกว่า 0'), 'error');
      return false;
    }

    if (hasDeadline && year && month && day) {
      const selectedDate = new Date(Number(year.value), Number(month.value) - 1, Number(day.value));
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        showToastAlert(t('error_future_date', 'ตั้งเป้าหมายวันในอนาคตกันเถอะ!'), 'error');
        return false;
      }
    }
    return true;
  };

  const handleYearChange = (option: SingleValue<OptionType>) => {
    setYear(option);

    if (!option) {
      setMonth(null);
      setDay(null);
      return;
    }

    const selectedY = Number(option.value);
    const currentM = new Date().getMonth() + 1;

    if (selectedY === currentYear && month && Number(month.value) < currentM) {
      setMonth(null);
      setDay(null);
      return;
    }

    if (month && day && Number(month.value) === 2 && Number(day.value) === 29) {
      const isLeap = (selectedY % 4 === 0 && selectedY % 100 !== 0) || selectedY % 400 === 0;
      if (!isLeap) setDay(null);
    }
  };

  const handleMonthChange = (option: SingleValue<OptionType>) => {
    setMonth(option);

    if (!option) {
      setDay(null);
      return;
    }

    if (day) {
      const newMonthVal = Number(option.value);
      const currentDayVal = Number(day.value);

      let newMax = 31;
      if ([4, 6, 9, 11].includes(newMonthVal)) newMax = 30;
      else if (newMonthVal === 2) {
        if (year) {
          const y = Number(year.value);
          const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
          newMax = isLeap ? 29 : 28;
        } else {
          newMax = 29;
        }
      }

      if (currentDayVal > newMax) {
        setDay(null);
      }
    }
  };

  const handleDelete = async () => {
    const dataWithId = editData as GoalDraftData & { id?: string | number };
    if (!dataWithId || !dataWithId.id) return;

    setIsDeleting(true);
    try {
      await axios.delete(`/goal/${dataWithId.id}`);
      showToastAlert(t('delete_goal_success', 'ลบเป้าหมายสำเร็จ'), 'success');
      setIsDeleteModalOpen(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.log(err);
      showToastAlert(t('delete_error', 'เกิดข้อผิดพลาดในการลบ'), 'error');
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateInputs()) return;

    try {
      const deadline =
        hasDeadline && year && month && day
          ? `${year.value}-${month.value.padStart(2, '0')}-${day.value.padStart(2, '0')}`
          : null;

      const payload: GoalDraftData = {
        name: goalName,
        amount: Number(amount),
        deadline: deadline,
      };

      if (onUpdateDraft) {
        await onUpdateDraft(payload);
        return;
      }

      const dataWithId = editData as GoalDraftData & { id?: string | number };

      if (dataWithId?.id) {
        await axios.put(`/goal/${dataWithId.id}`, payload);
        showToastAlert(t('update_goal_success', 'อัปเดตเป้าหมายสำเร็จ'), 'success');
      } else {
        await axios.post('/goal', payload);
        showToastAlert(t('save_goal_success', 'บันทึกเป้าหมายใหม่สำเร็จ'), 'success');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const axiosError = err as AxiosError<ElysiaResponse>;
        const data = axiosError.response?.data;
        const customError = data?.errors?.find((e) => e.schema?.error)?.schema?.error;
        const errorMessage =
          customError ||
          data?.errors?.[0]?.summary ||
          data?.message ||
          t('error_default', 'เกิดข้อผิดพลาด');

        showToastAlert(errorMessage, 'error');
      } else if (err instanceof Error) {
        showToastAlert(err.message, 'error');
      } else {
        showToastAlert(t('unknown_error', 'เกิดข้อผิดพลาดไม่ทราบชนิด'), 'error');
      }
    }
  };

  const selectStyles: StylesConfig<OptionType, false> = {
    control: (base) => ({
      ...base,
      height: 36,
      minHeight: 36,
      borderRadius: 6,
      borderColor: 'var(--tw-border-opacity, #B1B0AD)',
      backgroundColor: 'transparent',
    }),
    singleValue: (base) => ({ ...base, color: 'inherit' }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? 'var(--tw-prose-bg, rgba(150,150,150,0.1))'
        : 'transparent',
      color: 'inherit',
    }),
    indicatorsContainer: (base) => ({ ...base, display: 'none' }),
    valueContainer: (base) => ({ ...base, padding: '0 8px' }),
    menuList: (base) => ({
      ...base,
      '::-webkit-scrollbar': {
        width: '0px',
        height: '0px',
        display: 'none',
      },
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }),
  };

  return (
    <>
      <div className="flex justify-center items-center" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white dark:bg-black-800 text-black-900 dark:text-white w-full max-w-96 rounded-2xl py-7 px-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-3 items-center">
              <h4 className="font-semibold dark:text-white">
                {onUpdateDraft ? t('edit_goal', 'แก้ไขเป้าหมาย') : t('goal_label', 'เป้าหมาย')}
              </h4>
              <Tooltip
                text={t('goal_tooltip', 'ตั้งเป้าหมายเงินออมเพื่อเก็บเงินให้ได้ตามเป้าหมาย')}
                position="right"
              />
            </div>

            <div
              onClick={onClose}
              className="bg-black-300 dark:bg-black-600 flex justify-center items-center rounded-full w-12 h-12 hover:bg-black-400 dark:hover:bg-black-500 cursor-pointer"
            >
              <RxCross2 size={25} />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium dark:text-gray-300">
                {t('goal_name', 'ชื่อเป้าหมาย')}
              </label>
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                className="border border-black-500 dark:border-black-500 dark:bg-black-800 w-full h-10 rounded-md px-3 text-black-900 dark:text-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium dark:text-gray-300">
                {t('amount_label', 'จำนวนเงิน')}
              </label>
              <input
                type="number"
                value={amount}
                min="0"
                onChange={(e) => setAmount(e.target.value)}
                className="border border-black-500 dark:border-black-500 dark:bg-black-800 w-full h-10 rounded-md px-3 text-black-900 dark:text-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center h-8">
                <label
                  htmlFor="hasDeadline"
                  className="text-sm font-medium cursor-pointer select-none text-black-900 dark:text-gray-300"
                >
                  <div className="flex items-center gap-3">
                    {t('duration_label', 'ระยะเวลา')}{' '}
                    <Tooltip
                      text={t('deadline_tooltip', 'กำหนดวันสิ้นสุดของเป้าหมาย')}
                      position="right"
                      type="help"
                    />
                  </div>
                </label>
                <input
                  type="checkbox"
                  id="hasDeadline"
                  checked={hasDeadline}
                  onChange={(e) => setHasDeadline(e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-gray-100 dark:bg-black-700 border-gray-300 dark:border-black-600 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {hasDeadline && (
                <div className="flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200 mt-1">
                  <div className="flex flex-col flex-1 min-w-0">
                    <Select<OptionType, false>
                      options={yearOptions}
                      value={year}
                      onChange={handleYearChange}
                      placeholder={t('year', 'ปี')}
                      isClearable
                      isSearchable={false}
                      styles={selectStyles}
                      menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                      classNames={{
                        control: () => 'dark:border-black-500',
                        menu: () =>
                          'bg-white dark:bg-black-800 border border-gray-100 dark:border-black-600',
                      }}
                    />
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <Select<OptionType, false>
                      options={monthOptions}
                      value={month}
                      onChange={handleMonthChange}
                      placeholder={t('month', 'เดือน')}
                      isClearable
                      isSearchable={false}
                      isOptionDisabled={(option) => {
                        if (!year) return false;
                        const currentY = new Date().getFullYear();
                        const currentM = new Date().getMonth() + 1;
                        return Number(year.value) === currentY && Number(option.value) < currentM;
                      }}
                      styles={selectStyles}
                      menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                      classNames={{
                        control: () => 'dark:border-black-500',
                        menu: () =>
                          'bg-white dark:bg-black-800 border border-gray-100 dark:border-black-600',
                      }}
                    />
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <Select<OptionType, false>
                      options={dayOptions}
                      value={day}
                      onChange={(option) => setDay(option)}
                      placeholder={t('day', 'วัน')}
                      isClearable
                      isSearchable={false}
                      isOptionDisabled={(option) => {
                        if (!year || !month) return false;
                        const currentY = new Date().getFullYear();
                        const currentM = new Date().getMonth() + 1;
                        const currentD = new Date().getDate();

                        if (Number(year.value) === currentY && Number(month.value) === currentM) {
                          return Number(option.value) < currentD;
                        }
                        return false;
                      }}
                      styles={selectStyles}
                      menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                      classNames={{
                        control: () => 'dark:border-black-500',
                        menu: () =>
                          'bg-white dark:bg-black-800 border border-gray-100 dark:border-black-600',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {editData && (
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex-1 py-3 rounded-xl bg-[#FF2D55] text-white text-sm font-semibold hover:bg-[#f91e46] transition"
                >
                  {t('delete', 'ลบ')}
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`flex-1 py-3 rounded-xl text-white text-sm font-semibold transition ${
                  canSubmit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {t('save_btn', 'บันทึก')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t('delete_goal_confirm', 'ต้องการลบเป้าหมายนี้ใช่หรือไม่?')}
        confirmText={
          isDeleting ? t('deleting', 'กำลังลบ...') : t('yes_delete_confirm', 'ใช่ ลบเลย')
        }
        cancelText={t('cancel_btn', 'ยกเลิก')}
      />
    </>
  );
};

export default Goal;
