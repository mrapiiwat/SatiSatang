import useAuthStore from '../../store/authStore';
import Image from '../../components/Image';

const Home = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  return (
    <>
      <div>token:{token}</div>
      <div>id:{user?.id}</div>
      <div>naem:{user?.name}</div>
      <div>email:{user?.email}</div>
      <div>balance:{user?.balance}</div>
      <Image src={`${import.meta.env.VITE_API_URL}/api/icon/2`} alt="hello" />
    </>
  );
};

export default Home;
