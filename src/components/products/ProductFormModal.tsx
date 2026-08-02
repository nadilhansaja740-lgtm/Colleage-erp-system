import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductCategory } from '../../types';
import { X, Save, Image as ImageIcon, Sparkles } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { addProduct, updateProduct, t } = useApp();

  const categories: ProductCategory[] = [
    'Shoes',
    'Bags',
    'Umbrellas',
    'Hats / Caps',
    'Hair Accessories',
    'Lip Products',
    'Perfumes',
    'Other Items',
  ];

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Shoes');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>(2000);
  const [sellingPrice, setSellingPrice] = useState<number | ''>(3200);
  const [stock, setStock] = useState<number | ''>(10);
  const [minStockLevel, setMinStockLevel] = useState<number | ''>(5);
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setCode(productToEdit.code);
      setName(productToEdit.name);
      setCategory(productToEdit.category);
      setBrand(productToEdit.brand);
      setColor(productToEdit.color);
      setSize(productToEdit.size);
      setPurchasePrice(productToEdit.purchasePrice);
      setSellingPrice(productToEdit.sellingPrice);
      setStock(productToEdit.stock);
      setMinStockLevel(productToEdit.minStockLevel);
      setImage(productToEdit.image);
      setDescription(productToEdit.description);
    } else {
      // Auto generate code prefix based on category
      const prefixMap: Record<ProductCategory, string> = {
        Shoes: 'MSP-SH-',
        Bags: 'MSP-BG-',
        Umbrellas: 'MSP-UM-',
        'Hats / Caps': 'MSP-HT-',
        'Hair Accessories': 'MSP-HA-',
        'Lip Products': 'MSP-LP-',
        Perfumes: 'MSP-PF-',
        'Other Items': 'MSP-OT-',
      };
      setCode(`${prefixMap[category]}${Math.floor(100 + Math.random() * 900)}`);
      setName('');
      setBrand('Minu Fashion');
      setColor('');
      setSize('');
      setPurchasePrice(1500);
      setSellingPrice(2500);
      setStock(12);
      setMinStockLevel(5);
      setImage('https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=500&q=80');
      setDescription('');
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || purchasePrice === '' || sellingPrice === '' || stock === '') return;

    const payload = {
      code,
      name,
      category,
      brand,
      color,
      size,
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      stock: Number(stock),
      minStockLevel: Number(minStockLevel) || 5,
      image: image || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=500&q=80',
      description,
    };

    if (productToEdit) {
      await updateProduct(productToEdit.id, payload);
    } else {
      await addProduct(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                {productToEdit ? t('editProduct') : t('addProduct')}
              </h3>
              <p className="text-xs text-gray-500">MINU SHOE PALACE Inventory Item</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('productCategory')} *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Code */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('productCode')} *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white uppercase font-mono"
              />
            </div>

            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('productName')} *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ladies High Heels Rose Gold"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('brand')}
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="DSI / Glamour / Minu"
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Size & Color */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {t('size')}
                </label>
                <input
                  type="text"
                  placeholder="38 / M / 100ml"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {t('color')}
                </label>
                <input
                  type="text"
                  placeholder="Black / Pink"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Purchase Price */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('purchasePrice')} *
              </label>
              <input
                type="number"
                required
                min="0"
                value={purchasePrice}
                onChange={(e) =>
                  setPurchasePrice(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Selling Price */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('sellingPrice')} *
              </label>
              <input
                type="number"
                required
                min="0"
                value={sellingPrice}
                onChange={(e) =>
                  setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('quantityStock')} *
              </label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) =>
                  setStock(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Minimum Stock Level */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('minStockLevel')} *
              </label>
              <input
                type="number"
                required
                min="1"
                value={minStockLevel}
                onChange={(e) =>
                  setMinStockLevel(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Image URL */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('productImage')}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('description')}
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product material, warranty or origin details..."
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-2 shadow-md shadow-rose-600/30 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{t('saveProduct')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
