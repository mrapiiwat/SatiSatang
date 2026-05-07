const Loading = () => {
  return (
    <div className="fixed inset-0 z-[99999] flex justify-center items-center bg-white dark:bg-black-900 transition-colors">
      <div className="relative flex justify-center items-center">
        <div className="absolute h-28 w-28 rounded-full border-4 border-transparent border-t-gray-800 border-r-gray-400  dark:border-t-white dark:border-r-gray-500 animate-spin" />
        <img
          className="h-20 w-20 object-cover rounded-full block dark:hidden"
          src="/SATISATANG.svg"
          alt="logo"
        />
        <img
          className="h-20 w-20 object-cover rounded-full hidden dark:block"
          src="/SATISATANG1.svg"
          alt="logo dark"
        />
      </div>
    </div>
  );
};

export default Loading;
