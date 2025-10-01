import axios from './axios';

export const me = async () => {
  return await axios.get('/me');
};
