'use client';
import IvDlBtn from './ivDlBtn';
import EsDlBtn from './esDlBtn';

const PdfDownload = ({ number, customer, account }) => {
  return (
    <>
      <IvDlBtn number={number} customer={customer} account={account} />
      <EsDlBtn number={number} customer={customer} account={account} />
    </>
  );
};

export default PdfDownload;
