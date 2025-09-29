import useAuthStore from '../../store/authStore';

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
      <button></button>
    </>
  );
};

export default Home;
