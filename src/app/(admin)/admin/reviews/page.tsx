'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  Star,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  Trash2,
  Eye,
  EyeOff,
  Plus,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import ReviewSourceBadge from '@/components/customer/ReviewSourceBadge';
import { ReviewSource } from '@prisma/client';

interface ReviewItem {
  id: string;
  vehicleId?: string | null;
  authorName: string;
  rating: number;
  reviewText: string;
  reviewDate: string;
  source: ReviewSource;
  sourceUrl?: string | null;
  isApproved: boolean;
  vehicle?: { name: string; brand: string } | null;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    authorName: '',
    rating: 5,
    reviewText: '',
    source: 'JUSTDIAL' as ReviewSource,
    sourceUrl: '',
    isApproved: true,
  });

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (res.ok && data.success) {
        setReviews(data.data || []);
      } else {
        setErrorMessage(data.error || 'Failed to load reviews');
      }
    } catch {
      setErrorMessage('Network error while loading reviews');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: !currentStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isApproved: !currentStatus } : r))
        );
        setSuccessMessage(
          !currentStatus ? 'Review approved for public display!' : 'Review hidden from public view.'
        );
      } else {
        alert(data.error || 'Failed to toggle review approval');
      }
    } catch {
      alert('Error updating review status');
    }
  };

  const handleDeleteReview = async (id: string, authorName: string) => {
    if (!confirm(`Delete review by ${authorName}?`)) return;

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        setSuccessMessage('Review deleted successfully.');
      } else {
        alert(data.error || 'Failed to delete review');
      }
    } catch {
      alert('Error deleting review');
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: formData.authorName,
          rating: formData.rating,
          reviewText: formData.reviewText,
          source: formData.source,
          sourceUrl: formData.sourceUrl || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage('Review added successfully!');
        setIsModalOpen(false);
        setFormData({
          authorName: '',
          rating: 5,
          reviewText: '',
          source: 'JUSTDIAL',
          sourceUrl: '',
          isApproved: true,
        });
        fetchReviews();
      } else {
        alert(data.error || 'Failed to add review');
      }
    } catch {
      alert('Error saving review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AdminHeader
        title="Reviews & Ratings Moderation"
        subtitle="Manage Justdial reviews, direct verified feedback, and customer ratings."
      />

      <main className="p-6 space-y-6">
        {/* Top Notifications */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-600 hover:text-emerald-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 hover:text-rose-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header Action Bar */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                All Customer Reviews ({reviews.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Approve or moderate reviews before they appear on the public website.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Review Record</span>
            </button>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span>Loading reviews...</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No reviews in database yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Author & Rating</th>
                    <th className="py-3.5 px-4">Source</th>
                    <th className="py-3.5 px-4">Review Content</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reviews.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900 block">{r.authorName}</span>
                        <div className="flex items-center gap-0.5 text-amber-500 mt-0.5">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-500" />
                          ))}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <ReviewSourceBadge source={r.source} sourceUrl={r.sourceUrl} />
                      </td>

                      <td className="py-4 px-4 max-w-xs sm:max-w-md">
                        <p className="text-slate-700 line-clamp-2 italic">
                          &ldquo;{r.reviewText}&rdquo;
                        </p>
                        {r.vehicle && (
                          <span className="text-[10px] text-blue-600 font-semibold block mt-1">
                            Vehicle: {r.vehicle.name}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-slate-400">
                        {new Date(r.reviewDate).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-4 px-4">
                        {r.isApproved ? (
                          <Badge variant="success">Approved</Badge>
                        ) : (
                          <Badge variant="warning">Pending Approval</Badge>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center space-x-1.5">
                          <button
                            onClick={() => handleToggleApproval(r.id, r.isApproved)}
                            className={`p-1.5 rounded-md transition-colors ${
                              r.isApproved
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={r.isApproved ? 'Hide from Website' : 'Approve for Website'}
                          >
                            {r.isApproved ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteReview(r.id, r.authorName)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete Review"
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
          )}
        </div>
      </main>

      {/* Add Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Add Customer / Partner Review</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Author Name *</label>
                <input
                  type="text"
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rating (1 to 5) *</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="5">5 Stars (Excellent)</option>
                    <option value="4">4 Stars (Very Good)</option>
                    <option value="3">3 Stars (Good)</option>
                    <option value="2">2 Stars (Fair)</option>
                    <option value="1">1 Star (Poor)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Review Source *</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as ReviewSource })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="JUSTDIAL">Justdial Verified</option>
                    <option value="VERIFIED_CUSTOMER">Direct Customer</option>
                    <option value="OTHER">Other Source</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Justdial Profile / Source URL (Optional)</label>
                <input
                  type="url"
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                  placeholder="https://www.justdial.com/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Review Text *</label>
                <textarea
                  rows={4}
                  value={formData.reviewText}
                  onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                  placeholder="Share details of the trip, driver behavior, cleanliness, and punctuality..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold shadow-sm transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Review</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
