import axios from './axios';

export const me = async (token: string) => {
  return await axios.get('/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
