import Link from 'next/link';
import { SlArrowLeft, SlArrowRight } from 'react-icons/sl';
import getAllInvoices from '@/app/(screen)/_utils/notion/getAllInvoices';

const Pagenation = async ({ params }) => {
  // console.log(params)
  const perPage = process.env.NEXT_PUBLIC_PER_PAGE;

  const invoices = await getAllInvoices();
  const count = invoices.length;

  const page = params.page ? params.page * 1 : 1;

  const start = (page - 1) * perPage + 1;
  const end = page * perPage > count ? count : page * perPage;

  const lastPage = Math.ceil(count / perPage);

  return (
    <>
      <span className='text-sm text-gray-700 dark:text-gray-400'>
        <span className='font-semibold text-gray-900 dark:text-white'>
          {start}
        </span>
        &nbsp;to&nbsp;
        <span className='font-semibold text-gray-900 dark:text-white'>
          {end}
        </span>
        &nbsp;/&nbsp;
        <span className='font-semibold text-gray-900 dark:text-white'>
          {count}
        </span>
        &nbsp;invoices.
      </span>

      <nav aria-label='Page navigation example'>
        <ul className='flex items-center -space-x-px h-8 text-sm'>
          {page > 1 && (
            <li>
              <Link
                href={`/invoice/list/${page - 1}`}
                className='flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white'
              >
                <span className='sr-only'>Previous</span>
                <SlArrowLeft />
              </Link>
            </li>
          )}

          {page - 2 > 0 && (
            <li>
              <Link
                href={`/invoice/list/${page - 2}`}
                className='flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white'
              >
                {page - 2}
              </Link>
            </li>
          )}

          {page - 1 > 0 && (
            <li>
              <Link
                href={`/invoice/list/${page - 1}`}
                className='flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white'
              >
                {page - 1}
              </Link>
            </li>
          )}

          <li>
            <Link
              href={`/invoice/list/${page}`}
              aria-current='page'
              className='z-10 flex items-center justify-center px-3 h-8 leading-tight text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            >
              {page}
            </Link>
          </li>

          {page + 1 <= lastPage && (
            <li>
              <Link
                href={`/invoice/list/${page + 1}`}
                className='flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
              >
                {page + 1}
              </Link>
            </li>
          )}

          {page + 2 <= lastPage && (
            <li>
              <Link
                href={`/invoice/list/${page + 2}`}
                className='flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
              >
                {page + 2}
              </Link>
            </li>
          )}

          {page < lastPage && (
            <li>
              <Link
                href={`/invoice/list/${page + 1}`}
                className='flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
              >
                <span className='sr-only'>Next</span>
                <SlArrowRight />
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
};

export default Pagenation;
