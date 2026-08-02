import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductCategory } from '../../types';
import { formatCurrency, isLowStock, isOutOfStock } from '../../utils/formatters';
import { ProductFormModal } from './ProductFormModal';
import { ProductDetailModal } from './ProductDetailModal';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Grid,
  List,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const { products, deleteProduct, t, language } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);

  const categories: string[] = [
    'All',
    'Shoes',
    'Bags',
    'Umbrellas',
    'Hats / Caps',
    'Hair Accessories',
    'Lip Products',
    'Perfumes',
    'Other Items',
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenAdd = () => {
    setProductToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setProductToEdit(p);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {t('navProducts')}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Manage your shop inventory items, stock levels, and pricing
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all flex items-center gap-2 transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addProduct')}</span>
        </button>
      </div>

      {/* Controls: Search, Category Filter, View Mode */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchProduct')}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {cat === 'All' ? t('allCategories') : cat}
              </button>
            ))}
          </div>

          {/* Toggle View */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-700 ml-auto flex-shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white dark:bg-gray-800 text-rose-600 shadow-xs' : 'text-gray-400'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white dark:bg-gray-800 text-rose-600 shadow-xs' : 'text-gray-400'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Display List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 space-y-3">
          <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            {t('noDataFound')}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="group bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 bg-gray-100 dark:bg-gray-900 overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-2 py-0.5 rounded-md shadow-xs">
                      {p.code}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                        isOutOfStock(p)
                          ? 'bg-rose-900 text-rose-200'
                          : isLowStock(p)
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {isOutOfStock(p)
                        ? t('outOfStock')
                        : isLowStock(p)
                        ? t('lowStock')
                        : `${p.stock} in Stock`}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    {p.category} • {p.brand}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">
                    {p.name}
                  </h3>
                  <div className="flex items-baseline justify-between text-xs pt-1">
                    <span className="text-gray-500 font-medium">Selling Price</span>
                    <span className="font-black text-rose-600 dark:text-rose-400 text-sm">
                      {formatCurrency(p.sellingPrice, language)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 border-t border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between text-xs">
                <button
                  onClick={() => setSelectedDetailProduct(p)}
                  className="px-2.5 py-1.5 rounded-xl text-gray-600 dark:text-gray-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 font-medium flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Details</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                    title={t('edit')}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(t('confirmDeleteProduct'))) {
                        deleteProduct(p.id);
                      }
                    }}
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                    title={t('delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                  <th className="py-3 px-4">{t('productCode')}</th>
                  <th className="py-3 px-4">{t('productName')}</th>
                  <th className="py-3 px-4">{t('productCategory')}</th>
                  <th className="py-3 px-4">{t('purchasePrice')}</th>
                  <th className="py-3 px-4">{t('sellingPrice')}</th>
                  <th className="py-3 px-4">{t('quantityStock')}</th>
                  <th className="py-3 px-4">{t('status')}</th>
                  <th className="py-3 px-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                      {p.code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                      />
                      <span>{p.name}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                      {p.category}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {formatCurrency(p.purchasePrice, language)}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                      {formatCurrency(p.sellingPrice, language)}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                      {p.stock}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedDetailProduct(p)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(t('confirmDeleteProduct'))) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        productToEdit={productToEdit}
      />

      {/* Product Details Modal */}
      <ProductDetailModal
        product={selectedDetailProduct}
        onClose={() => setSelectedDetailProduct(null)}
        onEdit={handleOpenEdit}
        onDelete={deleteProduct}
      />
    </div>
  );
};
