const InvoiceListRowItemLoading = () => {
  return (
    <section className='mt-4 border rounded border-stone-700 dark:border-slate-700 px-6 py-4 bg-stone-200 dark:bg-slate-900 shadow shaddow-stone-700 dark:shadow-slate-900'>
      <div className='flex justify-between mb-2'>
        <div className='skeleton rounded h-6 w-64' />
        <div className='skeleton rounded-full h-7 w-28' />
      </div>
      <div className='flex justify-between'>
        <div className='skeleton rounded-full h-3 w-36' />

        <div className='skeleton rounded-full h-3 w-44' />

        <div className='skeleton rounded-full h-3 w-56' />
      </div>
    </section>
  );
};

export default InvoiceListRowItemLoading;
