'use client';

import { useMemo } from 'react';
import { CgSpinnerTwo } from 'react-icons/cg';
import { SlCloudDownload } from 'react-icons/sl';
import { plain_text } from '@/app/(screen)/_utils/properties/plain_text';
import { usePdfDownload } from '@/app/_shared/hooks';

const IvDlBtn = ({ number, customer, account }) => {
  const fileName = useMemo(
    () =>
      `${plain_text(customer.properties['社名/個人名'])}${plain_text(customer.properties.敬称)}_請求書_${plain_text(account.properties.スラッグ)}_${number}.pdf`,
    [customer, account, number],
  );

  const { inProgress, downloadPdf } = usePdfDownload({
    apiPath: `/api/print/invoice/${number}`,
    fileName,
  });

  const progressComponent = useMemo(() => {
    if (inProgress) {
      return <CgSpinnerTwo className='animate-spin' />;
    }
    return <span />;
  }, [inProgress]);

  return (
    <>
      <button
        type='button'
        onClick={downloadPdf}
        className='flex items-center justify-start gap-2 rounded-md border border-green-700 text-green-100 bg-green-600 hover:bg-green-500 px-3 py-1 w-fit transition-all disabled:bg-green-800/70 disabled:cursor-progress'
        disabled={inProgress}
      >
        <SlCloudDownload /> 請求書ダウンロード {progressComponent}
      </button>
    </>
  );
};

export default IvDlBtn;
