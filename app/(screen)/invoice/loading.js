// ローディング
const InvoiceLoading = () => {
    return (
        <div className="w-full min-h-screen space-x-2 flex justify-center items-center dark:invert">
            <span className='sr-only'>Loading...</span>
            <div className='h-8 w-8 bg-slate-900 rounded-full animate-bounce [animation-delay:-0.3s]'></div>
            <div className='h-8 w-8 bg-slate-900 rounded-full animate-bounce [animation-delay:-0.15s]'></div>
            <div className='h-8 w-8 bg-slate-900 rounded-full animate-bounce'></div>
        </div>
    )
}

export default InvoiceLoading