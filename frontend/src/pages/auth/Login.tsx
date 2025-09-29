import React from 'react';
import { useState, useCallback, useMemo } from 'react';
import Logo from '../../../public/SATISATANG.svg';
import Google from '../../assets/Google.svg';
import Facebook from '../../assets/Facebook.svg';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const API_URL = import.meta.env.VITE_API_URL;

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
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

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      const LoginForm: LoginForm = { email, password };
      if (isUser === 'Login') {
        try {
          await actionLogin(LoginForm!);
          navigate('/user');
        } catch (error) {
          console.error('Login error:', error);
          setError('เกิดข้อผิดพลาดในการล็อกอิน');
        }
        return;
      }

      if (isUser === 'Register') {
        if (isLoading) return;
        setIsLoading(true);
        try {
          const res = await axios.post(`${API_URL}/api/register`, {
            email,
            password,
            name,
          });

          const userId = res.data.userId;

          sessionStorage.setItem('pendingVerification', 'true');
          sessionStorage.setItem('pendingUserId', userId);

          navigate(`/verify?userId=${userId}`);
        } catch (error) {
          console.error('Registration error:', error);
          setError('เกิดข้อผิดพลาดในการลงทะเบียน');
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
        } else if (message === 'OAUTH SIGN IN') {
          setError('คุณเคยสมัครด้วยบัญชี Google/Facebook กรุณาเข้าสู่ระบบด้วยวิธีนั้น');
        } else if (message === 'PENDING VERIFICATION') {
          try {
            const otpRes = await axios.post(`${API_URL}/api/resend-otp`, { email });
            const userId = otpRes.data.userId;

            sessionStorage.setItem('pendingVerification', 'true');
            sessionStorage.setItem('pendingUserId', userId);

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
    [email, password, name, isUser, validateEmail, actionLogin, navigate, isLoading],
  );

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const emailLabelClass = useMemo(() => {
    const hasValue = email.trim() !== '';
    return `absolute left-6 z-10 bg-white px-1 text-gray-400 text-base transition-all duration-300 ease-in-out
    ${hasValue ? 'top-[-10px] text-sm text-[#CECDCA]' : 'top-[18px] text-gray-400 text-base'}
    peer-focus:top-[-10px] peer-focus:text-sm peer-focus:text-black`;
  }, [email]);

  const passwordLabelClass = useMemo(
    () =>
      `absolute left-6 z-10 bg-white px-1 text-gray-400 text-base transition-all duration-300 ease-in-out
   ${password.trim() ? 'top-[-10px] text-sm text-[#CECDCA]' : 'top-[18px] text-gray-400 text-base'}
   peer-focus:top-[-10px] peer-focus:text-sm peer-focus:text-black`,
    [password],
  );

  const nameLabelClass = useMemo(
    () =>
      `absolute left-6 z-10 bg-white px-1 text-gray-400 text-base transition-all duration-300 ease-in-out
   ${name.trim() ? 'top-[-10px] text-sm text-[#CECDCA]' : 'top-[18px] text-gray-400 text-base'}
   peer-focus:top-[-10px] peer-focus:text-sm peer-focus:text-black`,
    [name],
  );

  const buttonClass = useMemo(
    () =>
      `flex items-center justify-center h-16 px-6 rounded-full gap-7 transition-colors ${
        isLoading
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-[#5300E8] hover:bg-[#4803c7] cursor-pointer'
      }`,
    [isLoading],
  );

  return (
    <div className="p-6">
      <div className="flex justify-center">
        <img className="w-8 object-contain" src={Logo} alt="SatiSatang Logo" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col mt-12 gap-5">
        <h1 className="text-xl font-medium text-center mb-2">สมัครเข้าใช้งานหรือเข้าสู่ระบบ</h1>

        <div className="relative w-full">
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleEmailChange}
            placeholder=" "
            required
            autoComplete="email"
            className="peer h-16 w-full border border-[#CECDCA] px-6 py-4 rounded-full text-base focus:outline-none focus:border-[#5300E8]"
          />
          <label htmlFor="email" className={emailLabelClass}>
            อีเมล
          </label>
        </div>

        {isUser === 'Login' && (
          <div className="relative w-full">
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder=" "
              required
              autoComplete="current-password"
              className="peer h-16 w-full border border-[#CECDCA] px-6 py-4 rounded-full text-base focus:outline-none focus:border-[#5300E8]"
            />
            <label htmlFor="password" className={passwordLabelClass}>
              รหัสผ่าน
            </label>
          </div>
        )}

        {isUser === 'Register' && (
          <div className="flex flex-col gap-5">
            <div className="relative w-full">
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder=" "
                required
                autoComplete="new-password"
                minLength={6}
                className="peer h-16 w-full border border-[#CECDCA] px-6 py-4 rounded-full text-base focus:outline-none focus:border-[#5300E8]"
              />
              <label htmlFor="password" className={passwordLabelClass}>
                รหัสผ่าน
              </label>
            </div>

            <div className="relative w-full">
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={handleNameChange}
                placeholder=" "
                required
                autoComplete="name"
                className="peer h-16 w-full border border-[#CECDCA] px-6 py-4 rounded-full text-base focus:outline-none focus:border-[#5300E8]"
              />
              <label htmlFor="name" className={nameLabelClass}>
                ชื่อ
              </label>
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm text-center mb-2" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        <button type="submit" disabled={isLoading} className={buttonClass}>
          <p className="text-xl font-semibold text-[#FEFCFA]">
            {isLoading ? 'กำลังดำเนินการ' : 'ดำเนินการต่อ'}
          </p>
        </button>
      </form>

      <div className="relative my-7 flex items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-gray-500">หรือ</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <div className="flex flex-col gap-5">
        <button
          type="button"
          onClick={googleLogin}
          className="flex items-center h-16 border border-[#CECDCA] px-6 rounded-full gap-7 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <img className="w-8 object-contain" src={Google} alt="Google Logo" />
          <h4 className="text-base">ดำเนินการต่อด้วย Google</h4>
        </button>

        <button
          type="button"
          onClick={facebookLogin}
          className="flex items-center h-16 border border-[#CECDCA] px-6 rounded-full gap-7 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <img className="w-8 object-contain" src={Facebook} alt="Facebook Logo" />
          <h4 className="text-base">ดำเนินการต่อด้วย Facebook</h4>
        </button>
      </div>
    </div>
  );
};

export default Login;
