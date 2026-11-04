import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Upload,
  Eye,
  Sliders,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { optimizeImageFile } from '../../utils/imageOptimizer';

export default function BannerManager({ categories = [] }) {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [imageUploadType, setImageUploadType] = useState('url');
  const [previewIndex, setPreviewIndex] = useState(0);

  // Form State
  const [formBanner, setFormBanner] = useState({
    title: '',
    subtitle: '',
    image: '',
    targetType: 'CATEGORY',
    targetValue: categories[0]?.id || 'cat_1',
    displayOrder: 1,
    active: true
  });

  const loadBanners = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getAllBanners();
      setBanners(data || []);
    } catch (e) {
      console.warn('Failed to load banners:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const activeBanners = banners.filter(b => b.active);

  // Auto-slide preview every 4 seconds
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setPreviewIndex(prev => (prev + 1) % activeBanners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const handleOpenAddModal = () => {
    setEditingBanner(null);
    setFormBanner({
      title: '',
      subtitle: '',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
      targetType: 'CATEGORY',
      targetValue: categories[0]?.id || 'cat_1',
      displayOrder: banners.length + 1,
      active: true
    });
    setImageUploadType('url');
    setShowModal(true);
  };

  const handleOpenEditModal = (banner) => {
    setEditingBanner(banner);
    setFormBanner({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image: banner.image || '',
      targetType: banner.targetType || 'CATEGORY',
      targetValue: banner.targetValue || '',
      displayOrder: banner.displayOrder || 1,
      active: banner.active !== undefined ? banner.active : true
    });
    setImageUploadType(banner.image?.startsWith('data:') ? 'file' : 'url');
    setShowModal(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('File size exceeds 20MB. Please choose a smaller image.');
      return;
    }

    try {
      const { dataUrl } = await optimizeImageFile(file, 1400, 700, 0.85);
      if (dataUrl) {
        setFormBanner(prev => ({
          ...prev,
          image: dataUrl
        }));
      }
    } catch (err) {
      console.warn('Banner image processing error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formBanner.title || !formBanner.image) {
      alert('Please fill out the banner title and image.');
      return;
    }

    try {
      if (editingBanner) {
        await apiClient.updateBanner(editingBanner.id, formBanner);
      } else {
        await apiClient.addBanner(formBanner);
      }
      setShowModal(false);
      setEditingBanner(null);
      await loadBanners();
    } catch (err) {
      alert(err.message || 'Failed to save banner');
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      await apiClient.updateBanner(banner.id, { active: !banner.active });
      await loadBanners();
    } catch (err) {
      alert('Failed to update banner status');
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete banner "${title}"?`)) return;
    try {
      await apiClient.deleteBanner(id);
      await loadBanners();
    } catch (err) {
      alert('Failed to delete banner');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-amber-500" />
            Advertisements & Banners
          </h1>
          <p className="text-xs text-gray-500">
            Create promotional banners, configure click targets, and manage home screen carousel sliders for the Customer App
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> Add New Banner
        </button>
      </div>

      {/* Customer App Live Slider Simulation Card */}
      {activeBanners.length > 0 && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-400/20 text-amber-400 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
                  Live Customer App Slider Preview ({activeBanners.length} Active Banners)
                </h3>
                <p className="text-[11px] text-slate-400">
                  This interactive preview simulates the auto-sliding carousel displayed on customer phones.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPreviewIndex((previewIndex - 1 + activeBanners.length) % activeBanners.length)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewIndex((previewIndex + 1) % activeBanners.length)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Banner Preview Frame */}
          <div className="relative rounded-2xl overflow-hidden aspect-[21/9] sm:aspect-[24/8] max-h-56 bg-slate-800 border border-slate-700 shadow-inner group">
            <img
              src={activeBanners[previewIndex]?.image}
              alt={activeBanners[previewIndex]?.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center p-6 text-white">
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider w-fit mb-1.5">
                Order #{activeBanners[previewIndex]?.displayOrder} • Active
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-md">
                {activeBanners[previewIndex]?.title}
              </h2>
              {activeBanners[previewIndex]?.subtitle && (
                <p className="text-xs sm:text-sm font-semibold text-amber-200 mt-0.5 drop-shadow">
                  {activeBanners[previewIndex]?.subtitle}
                </p>
              )}
              <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-slate-300">
                <span>Target: {activeBanners[previewIndex]?.targetType} ({activeBanners[previewIndex]?.targetValue || 'All'})</span>
                <ArrowRight className="w-3 h-3 text-amber-400" />
              </div>
            </div>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {activeBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPreviewIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${idx === previewIndex ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Banners List Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-gray-900">
            Configured Advertisements ({banners.length})
          </h3>
          <span className="text-xs text-gray-500 font-semibold">
            {activeBanners.length} Active / {banners.length - activeBanners.length} Inactive
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-500 font-extrabold uppercase text-[10px] border-b">
              <tr>
                <th className="p-3.5">Banner Preview</th>
                <th className="p-3.5">Title & Subtitle</th>
                <th className="p-3.5">Target Action</th>
                <th className="p-3.5 text-center">Display Order</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400 font-medium">
                    Loading banners...
                  </td>
                </tr>
              ) : banners.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400 font-medium">
                    No advertisements configured yet. Click "+ Add New Banner" to create one.
                  </td>
                </tr>
              ) : (
                banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-gray-50/80 transition">
                    <td className="p-3.5">
                      <div className="w-24 h-14 rounded-xl overflow-hidden border bg-gray-100 flex-shrink-0">
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80';
                          }}
                        />
                      </div>
                    </td>

                    <td className="p-3.5">
                      <h4 className="font-extrabold text-gray-900 text-sm">{banner.title}</h4>
                      {banner.subtitle && (
                        <p className="text-gray-500 text-[11px] mt-0.5">{banner.subtitle}</p>
                      )}
                      <span className="text-[10px] text-gray-400">ID: {banner.id}</span>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                        {banner.targetType}: {banner.targetValue || 'Default'}
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="font-black text-gray-800 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
                        #{banner.displayOrder}
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleToggleActive(banner)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black transition ${
                          banner.active
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-500 border border-gray-300 hover:bg-gray-200'
                        }`}
                        title="Click to toggle active status"
                      >
                        {banner.active ? '● Active' : '○ Inactive'}
                      </button>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(banner)}
                          className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          title="Edit Banner"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(banner.id, banner.title)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Banner Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-8 border">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-extrabold text-base text-gray-900">
                  {editingBanner ? 'Edit Banner Advertisement' : 'Add New Banner Advertisement'}
                </h3>
                <p className="text-[11px] text-gray-400">
                  Configure headline, promotional image, target destination, and slider order
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Banner Headline / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 30% OFF on Organic Veggies"
                  value={formBanner.title}
                  onChange={(e) => setFormBanner({ ...formBanner, title: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Subtitle / Promo Tagline (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delivered fresh in 8 minutes"
                  value={formBanner.subtitle}
                  onChange={(e) => setFormBanner({ ...formBanner, subtitle: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600"
                />
              </div>

              {/* Target Configuration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Target Action</label>
                  <select
                    value={formBanner.targetType}
                    onChange={(e) => setFormBanner({ ...formBanner, targetType: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 font-semibold"
                  >
                    <option value="CATEGORY">Category Link</option>
                    <option value="SEARCH">Search Query</option>
                    <option value="EXTERNAL">External / Promo Link</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    {formBanner.targetType === 'CATEGORY' ? 'Select Category' : 'Target Value / Query'}
                  </label>
                  {formBanner.targetType === 'CATEGORY' ? (
                    <select
                      value={formBanner.targetValue}
                      onChange={(e) => setFormBanner({ ...formBanner, targetValue: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 font-semibold"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. Milk or https://..."
                      value={formBanner.targetValue}
                      onChange={(e) => setFormBanner({ ...formBanner, targetValue: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600"
                    />
                  )}
                </div>
              </div>

              {/* Display Order & Active Checkbox */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Display Order (Slider Position)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formBanner.displayOrder}
                    onChange={(e) => setFormBanner({ ...formBanner, displayOrder: parseInt(e.target.value, 10) || 1 })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 font-bold"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-extrabold text-gray-800">
                    <input
                      type="checkbox"
                      checked={formBanner.active}
                      onChange={(e) => setFormBanner({ ...formBanner, active: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span>Active on Customer App</span>
                  </label>
                </div>
              </div>

              {/* Banner Image Upload / URL */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-700">Banner Image <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageUploadType('file')}
                      className={`px-2 py-0.5 rounded font-bold transition ${imageUploadType === 'file' ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadType('url')}
                      className={`px-2 py-0.5 rounded font-bold transition ${imageUploadType === 'url' ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {imageUploadType === 'file' ? (
                  <label className="border-2 border-dashed border-gray-300 hover:border-emerald-600 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-emerald-50/30 transition text-center">
                    <Upload className="w-5 h-5 text-gray-400 mb-1" />
                    <span className="font-bold text-gray-700 text-[11px]">Click to upload banner graphic</span>
                    <span className="text-[10px] text-gray-400">Recommended size: 1200x500 (PNG, JPG, WebP)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={formBanner.image}
                    onChange={(e) => setFormBanner({ ...formBanner, image: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600"
                  />
                )}

                {formBanner.image && (
                  <div className="relative rounded-xl overflow-hidden aspect-[21/9] border bg-gray-100 max-h-36">
                    <img src={formBanner.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow transition"
                >
                  {editingBanner ? 'Save Changes' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
