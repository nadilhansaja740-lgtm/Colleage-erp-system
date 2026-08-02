import React from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCategory } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import {
  Footprints,
  ShoppingBag,
  Umbrella,
  Crown,
  Sparkles,
  Heart,
  Flame,
  Grid,
  ArrowRight,
} from 'lucide-react';

export const CategoriesView: React.FC = () => {
  const { products, setActiveTab, t, language } = useApp();

  const categoryConfigs: {
    category: ProductCategory;
    icon: React.ReactNode;
    gradient: string;
  }[] = [
    {
      category: 'Shoes',
      icon: <Footprints className="w-6 h-6" />,
      gradient: 'from-rose-500 to-rose-700',
    },
    {
      category: 'Bags',
      icon: <ShoppingBag className="w-6 h-6" />,
      gradient: 'from-purple-500 to-indigo-700',
    },
    {
      category: 'Umbrellas',
      icon: <Umbrella className="w-6 h-6" />,
      gradient: 'from-sky-500 to-blue-700',
    },
    {
      category: 'Hats / Caps',
      icon: <Crown className="w-6 h-6" />,
      gradient: 'from-amber-500 to-orange-700',
    },
    {
      category: 'Hair Accessories',
      icon: <Sparkles className="w-6 h-6" />,
      gradient: 'from-pink-500 to-rose-600',
    },
    {
      category: 'Lip Products',
      icon: <Heart className="w-6 h-6" />,
      gradient: 'from-red-500 to-rose-700',
    },
    {
      category: 'Perfumes',
      icon: <Flame className="w-6 h-6" />,
      gradient: 'from-emerald-500 to-teal-700',
    },
    {
      category: 'Other Items',
      icon: <Grid className="w-6 h-6" />,
      gradient: 'from-slate-600 to-slate-800',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          {t('navCategories')}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          MINU SHOE PALACE retail category distribution and inventory values
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categoryConfigs.map((cfg) => {
          const catProducts = products.filter((p) => p.category === cfg.category);
          const itemCount = catProducts.length;
          const totalStock = catProducts.reduce((acc, p) => acc + p.stock, 0);
          const totalValue = catProducts.reduce(
            (acc, p) => acc + p.stock * p.sellingPrice,
            0
          );

          return (
            <div
              key={cfg.category}
              className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    {cfg.category}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {itemCount} product items
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cfg.gradient} text-white flex items-center justify-center shadow-md`}
                >
                  {cfg.icon}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Stock Qty</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatNumber(totalStock)} Pcs
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Retail Inventory Valuation</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(totalValue, language)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('products')}
                className="w-full py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
