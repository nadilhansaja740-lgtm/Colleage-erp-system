import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatCurrency, formatNumber, isLowStock, isOutOfStock } from '../../utils/formatters';
import { Boxes, AlertTriangle, Plus, Minus, Check, Save } from 'lucide-react';

export const StockView: React.FC = () => {
  const { products, updateProduct, t, language } = useApp();

  const [filterMode, setFilterMode] = useState<'all' | 'low' | 'out'>('all');
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({});

  const filteredProducts = products.filter((p) => {
    if (filterMode === 'low') return isLowStock(p);
    if (filterMode === 'out') return isOutOfStock(p);
    return true;
  });

  const totalCostVal = products.reduce((acc, p) => acc + p.stock * p.purchasePrice, 0);
  const totalRetailVal = products.reduce((acc, p) => acc + p.stock * p.sellingPrice, 0);
  const lowStockCount = products.filter((p) => isLowStock(p) || isOutOfStock(p)).length;

  const handleStockChange = (id: string, delta: number) => {
    const current = stockEdits[id] !== undefined ? stockEdits[id] : products.find((p) => p.id === id)?.stock || 0;
    const nextVal = Math.max(0, current + delta);
    setStockEdits((prev) => ({ ...prev, [id]: nextVal }));
  };

  const handleSaveStock = async (p: Product) => {
    const newStock = stockEdits[p.id];
    if (newStock !== undefined) {
      await updateProduct(p.id, { stock: newStock });
      setStockEdits((prev) => {
        const copy = { ...prev };
        delete copy[p.id];
        return copy;
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          {t('navStock')}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Monitor inventory stock levels, update store quantities, and manage low-stock warnings
        </p>
      </div>

      {/* Stock Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
          <p className="text-xs font-semibold text-gray-500">Total Store Inventory Cost</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {formatCurrency(totalCostVal, language)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
          <p className="text-xs font-semibold text-gray-500">Total Retail Inventory Value</p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(totalRetailVal, language)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
          <p className="text-xs font-semibold text-gray-500">Low Stock / Out of Stock</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {lowStockCount} Products
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
        <button
          onClick={() => setFilterMode('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterMode === 'all'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          All Stock ({products.length})
        </button>
        <button
          onClick={() => setFilterMode('low')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filterMode === 'low'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Low Stock Warning ({products.filter(isLowStock).length})</span>
        </button>
        <button
          onClick={() => setFilterMode('out')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterMode === 'out'
              ? 'bg-rose-900 text-white shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Out of Stock ({products.filter(isOutOfStock).length})
        </button>
      </div>

      {/* Stock Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                <th className="py-3.5 px-4">{t('productCode')}</th>
                <th className="py-3.5 px-4">{t('productName')}</th>
                <th className="py-3.5 px-4">{t('productCategory')}</th>
                <th className="py-3.5 px-4">{t('minStockLevel')}</th>
                <th className="py-3.5 px-4">{t('quantityStock')}</th>
                <th className="py-3.5 px-4">{t('status')}</th>
                <th className="py-3.5 px-4 text-center">Adjust Stock Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {filteredProducts.map((p) => {
                const currentEditVal = stockEdits[p.id] !== undefined ? stockEdits[p.id] : p.stock;
                const isEdited = stockEdits[p.id] !== undefined && stockEdits[p.id] !== p.stock;

                return (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                      {p.code}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                      />
                      <span>{p.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                      {p.category}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 font-medium">
                      {p.minStockLevel} Pcs
                    </td>
                    <td className="py-3.5 px-4 font-black text-sm text-gray-900 dark:text-white">
                      {p.stock}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isOutOfStock(p)
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : isLowStock(p)
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {isOutOfStock(p)
                          ? t('outOfStock')
                          : isLowStock(p)
                          ? t('lowStock')
                          : t('inStock')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleStockChange(p.id, -1)}
                          className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-rose-100 hover:text-rose-600 font-bold flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          value={currentEditVal}
                          onChange={(e) =>
                            setStockEdits({ ...stockEdits, [p.id]: Math.max(0, Number(e.target.value)) })
                          }
                          className="w-16 text-center py-1 rounded-lg border border-gray-300 dark:border-gray-600 font-bold bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs"
                        />
                        <button
                          onClick={() => handleStockChange(p.id, 1)}
                          className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-emerald-100 hover:text-emerald-600 font-bold flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        {isEdited && (
                          <button
                            onClick={() => handleSaveStock(p)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
