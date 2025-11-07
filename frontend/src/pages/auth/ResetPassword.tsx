// src/pages/ResetPassword.tsx
import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token') || '';
  const uidFromUrl = searchParams.get('uid') || '';

  const [newPassword, setNewPassword] = useState<string>('');
  const [confirm, setConfirm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const verifyLink = async () => {
      try {
        if (!tokenFromUrl || !uidFromUrl) {
          navigate('/');
          return;
        }
        const res = await axios.get('/reset-password/verify', {
          params: { token: tokenFromUrl, uid: uidFromUrl },
        });

        if (!res.data.valid) {
          navigate('/');
        } else {
          window.history.replaceState({}, '', '/reset-password');
        }
      } catch {
        navigate('/');
      }
    };

    verifyLink();
  }, [tokenFromUrl, uidFromUrl, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      setMsg('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/reset-password', {
        token: tokenFromUrl,
        uid: Number(uidFromUrl),
        newPassword,
      });
      setMsg('Password reset successful. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      console.log(err);

      let message = 'Something went wrong';

      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        message = axiosErr.response?.data?.message ?? message;
      }

      setMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Reset password</h2>
      {msg && <p>{msg}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <button disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
      </form>
    </div>
  );
}
