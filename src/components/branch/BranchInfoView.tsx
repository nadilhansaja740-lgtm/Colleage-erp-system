import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, MapPin, Phone, Store, Save, Footprints, Check } from 'lucide-react';

export const BranchInfoView: React.FC = () => {
  const { businessInfo, updateBusinessInfo, t } = useApp();

  const [name, setName] = useState(businessInfo.name);
  const [branch, setBranch] = useState(businessInfo.branch);
  const [address, setAddress] = useState(businessInfo.address);
  const [contactNumber, setContactNumber] = useState(businessInfo.contactNumber);
  const [businessType, setBusinessType] = useState(businessInfo.businessType);
  const [receiptFooter, setReceiptFooter] = useState(businessInfo.receiptFooter);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateBusinessInfo({
      name,
      branch,
      address,
      contactNumber,
      businessType,
      receiptFooter,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          {t('branchInfoTitle')}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Official store branch details printed on customer sales receipts and invoice headers
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Branch details saved successfully!</span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md">
            <Footprints className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white">
              {businessInfo.name}
            </h2>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
              {businessInfo.branch} • Buttala, Sri Lanka
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('businessName')} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('branch')} *
              </label>
              <input
                type="text"
                required
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('address')} *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('contactNumber')} *
              </label>
              <input
                type="text"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('businessType')}
              </label>
              <input
                type="text"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Receipt Footer Message
              </label>
              <input
                type="text"
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{t('save')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
