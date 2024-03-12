// ローディング
const InvoiceLoading = () => {
  return (
    <div className='w-full min-h-screen space-x-2 flex justify-center items-center dark:invert'>
      <span className='sr-only'>Loading...</span>
      <div className='h-4 w-4 bg-slate-900 rounded-full animate-bounce [animation-delay:-0.3s]' />
      <div className='h-4 w-4 bg-slate-900 rounded-full animate-bounce [animation-delay:-0.15s]' />
      <div className='h-4 w-4 bg-slate-900 rounded-full animate-bounce' />
    </div>
  );
};

export default InvoiceLoading;
