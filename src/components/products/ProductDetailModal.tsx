import React from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatCurrency, isLowStock, isOutOfStock } from '../../utils/formatters';
import { X, Tag, ShieldCheck, Box, Barcode, Calendar, Edit, Trash2 } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { t, language } = useApp();

  if (!product) return null;

  const margin = product.sellingPrice - product.purchasePrice;
  const marginPct = product.purchasePrice > 0 ? Math.round((margin / product.purchasePrice) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-3 flex gap-2">
            <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-bold shadow-md">
              {product.category}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                isOutOfStock(product)
                  ? 'bg-rose-950 text-rose-300'
                  : isLowStock(product)
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {isOutOfStock(product)
                ? t('outOfStock')
                : isLowStock(product)
                ? t('lowStock')
                : t('inStock')}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg">
                {product.code}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {product.dateAdded}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2">
              {product.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Brand: {product.brand || 'N/A'} • Color: {product.color || 'N/A'} • Size: {product.size || 'Standard'}
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-center">
            <div>
              <p className="text-[10px] font-medium text-gray-500">{t('purchasePrice')}</p>
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                {formatCurrency(product.purchasePrice, language)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-500">{t('sellingPrice')}</p>
              <p className="text-sm font-black text-rose-600 dark:text-rose-400 mt-0.5">
                {formatCurrency(product.sellingPrice, language)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-500">Margin Profit</p>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                +{formatCurrency(margin, language)} ({marginPct}%)
              </p>
            </div>
          </div>

          {/* Stock Info */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-rose-500" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {t('quantityStock')}:
              </span>
            </div>
            <span className="font-black text-base text-gray-900 dark:text-white">
              {product.stock} Units (Min: {product.minStockLevel})
            </span>
          </div>

          {/* Simulated Barcode Hardware Ready Box */}
          <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Barcode className="w-6 h-6 text-rose-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Barcode Ready Structure</p>
                <p className="font-mono text-xs text-slate-200 tracking-wider">||||| ||| |||| ||||| {product.code}</p>
              </div>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded-md">
              Scanner Ready
            </span>
          </div>

          {product.description && (
            <p className="text-xs text-gray-600 dark:text-gray-300 italic">
              "{product.description}"
            </p>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <button
              onClick={() => {
                if (window.confirm(t('confirmDeleteProduct'))) {
                  onDelete(product.id);
                  onClose();
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center gap-1.5 hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('delete')}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(product);
              }}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all"
            >
              <Edit className="w-4 h-4" />
              <span>{t('edit')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
