import React, { useEffect } from 'react';
import { useState, useCallback } from 'react';
import Google from '../../assets/Google.svg';
import Facebook from '../../assets/Facebook.svg';
import axios from '../../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import OAuthButton from '../../components/OAuthButton';
import SubmitButton from '../../components/SubmitButton';
import InputField from '../../components/InputField';
import Logo from '../../components/Logo';
import PageWrapper from '../../components/PageWrapper';
import { AxiosError } from 'axios';
import { showToastAlert } from '../../store/toastStore';
import type { LoginForm } from '../../interface/auth';
import type { ElysiaResponse } from '../../interface/error';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const API_URL = import.meta.env.VITE_API_URL;

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isUser, setIsUser] = useState<string>('Guest');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const actionLogin = useAuthStore((state) => state.actionLogin);
  const navigate = useNavigate();

  const validateEmail = useCallback((email: string): boolean => {
    return EMAIL_REGEX.test(email);
  }, []);

  const googleLogin = useCallback(() => {
    window.location.href = `${API_URL}/api/google`;
  }, []);

  const facebookLogin = useCallback(() => {
    window.location.href = `${API_URL}/api/facebook`;
  }, []);

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);

      if (isUser !== 'Guest') {
        setIsUser('Guest');
        setPassword('');
        setConfirmPassword('');
        setName('');
        setError('');
      }
    },
    [isUser],
  );

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  useEffect(() => {
    const storeEmail = sessionStorage.getItem('userEmail');
    if (storeEmail) {
      sessionStorage.removeItem('userEmail');
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      const LoginForm: LoginForm = { email, password };

      if (isUser === 'Login') {
        try {
          actionLogin(LoginForm!);
          showToastAlert('เข้าสู่ระบบสำเร็จ', 'success');
          navigate('/user');
        } catch (error) {
          console.log(error);
          showToastAlert('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 'error');
        }
        return;
      }

      if (isUser === 'Register') {
        if (isLoading) return;
        setIsLoading(true);

        if (password !== confirmPassword) {
          setError('รหัสผ่านไม่ตรงกัน');
          setIsLoading(false);
          return;
        }

        try {
          const res = await axios.post(`${API_URL}/api/register`, {
            email,
            password,
            name,
          });

          const userId = res.data.userId;

          sessionStorage.setItem('pendingVerification', 'true');
          sessionStorage.setItem('pendingUserId', userId);
          sessionStorage.setItem('userEmail', email);

          navigate(`/verify?userId=${userId}`);
        } catch (error: unknown) {
          const axiosError = error as AxiosError<ElysiaResponse>;
          const responseData = axiosError.response?.data;

          if (responseData) {
            const customError = responseData?.errors?.find((e) => e.schema?.error);

            const targetError = customError || responseData?.errors?.[0];

            const errorMessage =
              targetError?.schema?.error ||
              targetError?.summary ||
              responseData?.message ||
              'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล';

            setError(errorMessage);
          } else {
            setError('เกิดข้อผิดพลาดในการลงทะเบียน');
          }
        } finally {
          setIsLoading(false);
        }

        return;
      }

      if (!email.trim()) {
        setError('กรุณากรอกอีเมล');
        return;
      }

      if (!validateEmail(email)) {
        setError('รูปแบบอีเมลไม่ถูกต้อง');
        return;
      }

      setIsLoading(true);

      try {
        const res = await axios.post(`${API_URL}/api/check-email`, { email });
        const message = res.data.message;

        if (message === 'SIGN IN') {
          setIsUser('Login');
        } else if (message === 'SIGN UP') {
          setIsUser('Register');
        } else if (message === 'OAUTH SIGN IN (GOOGLE)') {
          googleLogin();
        } else if (message === 'OAUTH SIGN IN (FACEBOOK)') {
          facebookLogin();
        } else if (message === 'PENDING VERIFICATION') {
          try {
            const otpRes = await axios.post(`${API_URL}/api/resend-otp`, { email });
            const userId = otpRes.data.userId;

            sessionStorage.setItem('pendingVerification', 'true');
            sessionStorage.setItem('pendingUserId', userId);
            sessionStorage.setItem('userEmail', email);

            navigate(`/verify?userId=${userId}`);
          } catch (otpError: unknown) {
            console.error('Resend OTP error:', otpError);

            if (otpError && typeof otpError === 'object' && 'response' in otpError) {
              const axiosError = otpError as {
                response?: { status?: number; data?: { message?: string } };
              };
              if (axiosError.response?.status === 429) {
                setError(axiosError.response.data?.message || 'กรุณารอสักครู่ก่อนขอ OTP ใหม่');
              } else if (axiosError.response?.status === 404) {
                setError('ไม่พบผู้ใช้งานหรือได้ยืนยันอีเมลแล้ว');
              } else {
                setError('กรุณายืนยันอีเมลก่อนใช้งาน - ไม่สามารถส่ง OTP ใหม่ได้');
              }
            } else {
              setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
            }
          }
        } else {
          setError('ไม่สามารถระบุสถานะได้');
        }
      } catch (error) {
        console.error('Email check error:', error);
        setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      } finally {
        setIsLoading(false);
      }
    },
    [
      email,
      password,
      name,
      isUser,
      validateEmail,
      actionLogin,
      navigate,
      isLoading,
      googleLogin,
      facebookLogin,
    ],
  );
  const handleResetPassword = async () => {
    if (!email) {
      showToastAlert('กรุณากรอกอีเมล', 'error');
      return;
    }
    try {
      await axios.post(`/forgot-password`, { email });
      navigate('/recovery?email=' + encodeURIComponent(email));
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<{ message?: string }>;
        showToastAlert(String(axiosError.response?.data), 'error');
      } else {
        showToastAlert('เกิดข้อผิดพลาด ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
      }
    }
  };

  return (
    <PageWrapper animation="scale-fade">
      <div className="p-6">
        <Link to="/" className="cursor-pointer">
          <Logo />
        </Link>

        <form onSubmit={handleSubmit} className="flex flex-col mt-12 gap-5">
          <h1 className="text-xl font-medium text-center mb-2">สมัครเข้าใช้งานหรือเข้าสู่ระบบ</h1>

          <div className="relative w-full">
            <InputField
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              label="อีเมล"
              autoComplete="email"
            />
          </div>

          {isUser === 'Login' && (
            <div className="relative w-full">
              <InputField
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                label="รหัสผ่าน"
                autoComplete="current-password"
              />
            </div>
          )}

          {isUser === 'Register' && (
            <div className="flex flex-col gap-5">
              <div className="relative w-full">
                <InputField
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  label="รหัสผ่าน"
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>

              <div className="relative w-full">
                <InputField
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  label="ยืนยันรหัสผ่าน"
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>

              <div className="relative w-full">
                <InputField
                  id="name"
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  label="ชื่อ"
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          {isUser === 'Login' ? (
            <div className="text-sky-700 text-sm text-center ">
              ลืมรหัสผ่าน?{' '}
              <a onClick={handleResetPassword} className="underline cursor-pointer">
                คลิกที่นี่
              </a>
            </div>
          ) : null}
          {error && (
            <div className="text-red-500 text-sm text-center" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <SubmitButton isLoading={isLoading} text="ดำเนินการต่อ" />
        </form>

        <div className="relative my-7 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500">หรือ</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="flex flex-col gap-5">
          <OAuthButton onClick={googleLogin} label="ดำเนินการต่อด้วย Google" logo={Google} />
          <OAuthButton onClick={facebookLogin} label="ดำเนินการต่อด้วย Facebook" logo={Facebook} />
        </div>
      </div>
    </PageWrapper>
  );
};

export default Login;
