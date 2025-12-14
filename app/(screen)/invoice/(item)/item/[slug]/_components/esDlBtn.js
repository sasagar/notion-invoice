'use client';

import { useMemo } from 'react';
import { CgSpinnerTwo } from 'react-icons/cg';
import { SlCloudDownload } from 'react-icons/sl';
import { plain_text } from '@/app/(screen)/_utils/properties/plain_text';
import { usePdfDownload } from '@/app/_shared/hooks';

const EsDlBtn = ({ number, customer, account }) => {
  const fileName = useMemo(
    () =>
      `${plain_text(customer.properties['社名/個人名'])}${plain_text(customer.properties.敬称)}_見積書_${plain_text(account.properties.スラッグ)}_${number}.pdf`,
    [customer, account, number],
  );

  const { inProgress, step, progress, downloadPdf } = usePdfDownload({
    apiPath: `/api/print/estimate/${number}`,
    fileName,
  });

  const progressComponent = useMemo(() => {
    switch (step) {
      case 'generating':
        return (
          <>
            <CgSpinnerTwo className='animate-spin' />
            <span className='text-xs'>生成中...</span>
          </>
        );
      case 'downloading':
        return (
          <>
            <CgSpinnerTwo className='animate-spin' />
            <span className='text-xs tabular-nums'>{progress}%</span>
          </>
        );
      case 'complete':
        return <span className='text-xs'>完了!</span>;
      default:
        return null;
    }
  }, [step, progress]);

  return (
    <button
      type='button'
      onClick={downloadPdf}
      className='flex items-center justify-start gap-2 rounded-md border border-amber-700 text-amber-100 bg-amber-600 hover:bg-amber-500 px-3 py-1 w-fit transition-all disabled:bg-amber-800/70 disabled:cursor-progress'
      disabled={inProgress}
    >
      <SlCloudDownload /> 見積書ダウンロード {progressComponent}
    </button>
  );
};

export default EsDlBtn;
