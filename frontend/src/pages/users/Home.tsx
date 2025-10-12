import useAuthStore from '../../store/authStore';
import PageWrapper from '../../components/PageWrapper';
import { FaApple } from 'react-icons/fa6';
import FloatingBubble from '../../components/user/FloatingBubble';

const Home = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const handleBubbleClick = () => {
    alert("เปิดแชท!");
  };

  return (
    <PageWrapper animation="fade" duration={1.5}>
      <div className="text-gray-500 break-words">token: {token}</div>
      <div>id:{user?.id}</div>
      <div>name:{user?.name}</div>
      <div>email:{user?.email}</div>
      <div>balance:{user?.balance}</div>
      <div className="flex justify-center border-y border-gray-300 py-11 gap-7">
        <FaApple size={80} />
        <FaApple size={80} />
        <FaApple size={80} />
        <FaApple size={80} />
        <FaApple size={80} />
      </div>
      <FloatingBubble onClick={handleBubbleClick} />

    </PageWrapper>
  );
};

export default Home;
