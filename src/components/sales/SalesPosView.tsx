import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, CartItem, PaymentMethod, Sale } from '../../types';
import { formatCurrency, isOutOfStock } from '../../utils/formatters';
import { ReceiptModal } from './ReceiptModal';
import { SalesHistoryModal } from './SalesHistoryModal';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  CreditCard,
  Building2,
  HelpCircle,
  CheckCircle2,
  History,
  Tag,
  User,
  Phone,
  Barcode,
} from 'lucide-react';

export const SalesPosView: React.FC = () => {
  const { products, processSale, t, language } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);

  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [cashReceived, setCashReceived] = useState<number | ''>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const categories = [
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
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const addToCart = (product: Product) => {
    if (isOutOfStock(product)) return;

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === product.id);
      if (existingIdx !== -1) {
        const copy = [...prev];
        const currentQty = copy[existingIdx].quantity;
        if (currentQty < product.stock) {
          copy[existingIdx].quantity += 1;
          copy[existingIdx].total =
            copy[existingIdx].quantity * product.sellingPrice - copy[existingIdx].discount;
        }
        return copy;
      } else {
        return [
          ...prev,
          {
            product,
            quantity: 1,
            discount: 0,
            total: product.sellingPrice,
          },
        ];
      }
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            if (nextQty > item.product.stock) return item;
            return {
              ...item,
              quantity: nextQty,
              total: nextQty * item.product.sellingPrice - item.discount,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.product.sellingPrice * item.quantity, 0);
  const finalTotal = Math.max(0, subtotal - discount);
  const numCashRec = Number(cashReceived) || 0;
  const changeDue = paymentMethod === 'Cash' ? Math.max(0, numCashRec - finalTotal) : 0;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'Cash' && numCashRec < finalTotal) {
      alert(t('insufficientCash'));
      return;
    }

    const sale = await processSale(
      cart,
      discount,
      paymentMethod,
      numCashRec || finalTotal,
      customerName,
      customerPhone
    );

    if (sale) {
      setCompletedSale(sale);
      setCart([]);
      setDiscount(0);
      setCashReceived('');
      setCustomerName('');
      setCustomerPhone('');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-rose-600" />
            <span>{t('posTitle')}</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Select products to build sales invoices, calculate change, and print receipts
          </p>
        </div>

        <button
          onClick={() => setShowHistory(true)}
          className="px-4 py-2 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold text-xs border border-gray-200/60 dark:border-gray-700 transition-all flex items-center gap-2"
        >
          <History className="w-4 h-4 text-rose-500" />
          <span>{t('salesHistory')}</span>
        </button>
      </div>

      {/* Main POS Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Product Selector Grid (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Category Tabs */}
          <div className="p-4 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('searchItems')}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
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
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredProducts.map((p) => {
              const outOfStock = isOutOfStock(p);
              return (
                <button
                  key={p.id}
                  disabled={outOfStock}
                  onClick={() => addToCart(p)}
                  className={`group relative text-left p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
                    outOfStock ? 'opacity-50 cursor-not-allowed' : 'hover:border-rose-300 dark:hover:border-rose-800'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="relative h-28 rounded-xl bg-gray-100 dark:bg-gray-900 overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-1.5 left-1.5 font-mono text-[9px] font-bold text-rose-600 bg-white/90 px-1.5 py-0.5 rounded-md shadow-xs">
                        {p.code}
                      </span>
                      {outOfStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                          Out of Stock
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-xs line-clamp-1">
                        {p.name}
                      </h4>
                      <p className="text-[10px] text-gray-400">Stock: {p.stock} Pcs</p>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                    <span className="font-black text-rose-600 dark:text-rose-400 text-xs">
                      {formatCurrency(p.sellingPrice, language)}
                    </span>
                    <span className="p-1 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Sales Cart & Billing Panel (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-rose-600" />
                <span>{t('cart')} ({cart.length})</span>
              </h3>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="text-center py-12 text-gray-400 space-y-2">
                <ShoppingCart className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600" />
                <p className="text-xs">{t('emptyCart')}</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs"
                  >
                    <div className="truncate pr-2">
                      <p className="font-bold text-gray-900 dark:text-white truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Rs. {item.product.sellingPrice} / pc
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="p-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-gray-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="p-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-black text-rose-600 dark:text-rose-400 w-16 text-right">
                        Rs.{item.total}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-gray-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Optional Customer Info */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-700 text-xs">
              <input
                type="text"
                placeholder={t('customerName')}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="p-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="text"
                placeholder={t('customerPhone')}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="p-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                {t('paymentMethod')}
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {(['Cash', 'Card', 'Bank Transfer', 'Other'] as PaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2 rounded-xl font-bold text-[11px] border transition-all ${
                      paymentMethod === m
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {m === 'Cash' ? t('cash') : m === 'Card' ? t('card') : m === 'Bank Transfer' ? 'Bank' : 'Other'}
                  </button>
                ))}
              </div>
            </div>

            {/* Discount & Cash Received inputs */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  {t('discountAmount')}
                </label>
                <input
                  type="number"
                  min="0"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full p-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-bold"
                />
              </div>

              {paymentMethod === 'Cash' && (
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    {t('cashReceived')} *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={cashReceived}
                    onChange={(e) =>
                      setCashReceived(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder={`e.g. ${finalTotal}`}
                    className="w-full p-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-bold"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Checkout Totals Summary & Submit Button */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal, language)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>Discount</span>
                  <span>-{formatCurrency(discount, language)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2">
                <span>{t('total')}</span>
                <span className="text-rose-600 dark:text-rose-400">
                  {formatCurrency(finalTotal, language)}
                </span>
              </div>

              {paymentMethod === 'Cash' && numCashRec > 0 && (
                <div className="flex justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 p-2 rounded-xl mt-1">
                  <span>{t('changeDue')}</span>
                  <span>{formatCurrency(changeDue, language)}</span>
                </div>
              )}
            </div>

            <button
              disabled={cart.length === 0}
              onClick={handleCheckout}
              className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{t('completeSale')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Receipts Modal */}
      <ReceiptModal
        sale={completedSale}
        onClose={() => setCompletedSale(null)}
      />

      {/* Sales History Modal */}
      <SalesHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onViewReceipt={(sale) => {
          setShowHistory(false);
          setCompletedSale(sale);
        }}
      />
    </div>
  );
};
