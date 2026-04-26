const Loading = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-white">
      <div className="relative flex justify-center items-center">
        <div className="absolute h-28 w-28 rounded-full border-4 border-transparent border-t-gray-800 border-r-gray-400 animate-spin" />
        <img className="h-20 w-20 object-cover rounded-full" src="/SATISATANG.svg" alt="logo" />
      </div>
    </div>
  );
};
export default Loading;
