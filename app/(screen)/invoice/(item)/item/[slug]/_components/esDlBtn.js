'use client';
import { useEffect, useState } from 'react';

import { plain_text } from '@/app/(screen)/_utils/properties/plain_text';
import { SlCloudDownload } from 'react-icons/sl';
import { CgSpinnerTwo } from 'react-icons/cg';

const EsDlBtn = ({ number, customer, account }) => {
  const spinner = () => {
    return <CgSpinnerTwo className='animate-spin' />;
  };

  const blank = () => {
    return (
      <>
        <span />
      </>
    );
  };

  const [inProgress, setInProgress] = useState(false);
  const [progressComponent, setProgressComponent] = useState(blank());

  const esPdfDl = () => {
    const xhr = new XMLHttpRequest();
    addListener(xhr);
    xhr.open('GET', `/api/print/estimate/${number}`, true);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${plain_text(
          customer.properties['社名/個人名'],
        )}${plain_text(customer.properties.敬称)}_見積書_${plain_text(
          account.properties.スラッグ,
        )}_${number}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        console.log('error');
      }
    };
    xhr.send();
    return xhr;
  };

  const handleEvent = e => {
    if (e.type === 'loadstart') {
      setInProgress(true);
    } else if (e.type === 'loadend') {
      setInProgress(false);
    }
  };

  const addListener = xhr => {
    xhr.addEventListener('loadstart', handleEvent);
    xhr.addEventListener('loadend', handleEvent);
  };

  useEffect(() => {
    if (inProgress) {
      setProgressComponent(spinner());
    } else {
      setProgressComponent(blank());
    }
  }, [inProgress]);

  return (
    <>
      <button
        type='button'
        onClick={esPdfDl}
        className='flex items-center justify-start gap-2 rounded-md border border-amber-700 text-amber-100 bg-amber-600 hover:bg-amber-500 px-3 py-1 w-fit transition-all disabled:bg-amber-800/70 disabled:cursor-progress'
        disabled={inProgress}
      >
        <SlCloudDownload /> 見積書ダウンロード {progressComponent}
      </button>
    </>
  );
};

export default EsDlBtn;
