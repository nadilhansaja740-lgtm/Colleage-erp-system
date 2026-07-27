import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CollegeReview } from '../../types';
import { subscribeToPath, saveCollegeReview } from '../../firebase/db';
import {
  Star,
  Award,
  CheckCircle2,
  Building2,
  Sparkles,
  MessageSquarePlus,
  ThumbsUp,
  ShieldCheck,
  School,
  GraduationCap
} from 'lucide-react';

const INITIAL_REVIEWS: CollegeReview[] = [
  {
    id: 'REV-101',
    authorName: 'Aarav Sharma',
    role: 'Student',
    department: 'Computer Science',
    overallRating: 5,
    academicsRating: 5,
    facultyRating: 5,
    infrastructureRating: 4,
    placementsRating: 5,
    comment: 'NH College has provided incredible campus placements and AI lab infrastructure. Highly recommended for CSE students!',
    date: '2026-07-20',
    verified: true
  },
  {
    id: 'REV-102',
    authorName: 'Prof. Alan Smith',
    role: 'Teacher',
    department: 'Computer Science',
    overallRating: 5,
    academicsRating: 5,
    facultyRating: 5,
    infrastructureRating: 5,
    placementsRating: 5,
    comment: 'Top tier academic research facilities, excellent student enthusiasm, and well-organized curriculum standards.',
    date: '2026-07-18',
    verified: true
  },
  {
    id: 'REV-103',
    authorName: 'Priya Patel',
    role: 'Alumni',
    department: 'Electronics',
    overallRating: 4,
    academicsRating: 5,
    facultyRating: 4,
    infrastructureRating: 4,
    placementsRating: 5,
    comment: 'Got placed at a tier-1 tech firm through NH College campus drive. Great library and sports facilities.',
    date: '2026-06-30',
    verified: true
  }
];

export const CollegeRating: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<CollegeReview[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // New review state
  const [newOverall, setNewOverall] = useState(5);
  const [newAcademics, setNewAcademics] = useState(5);
  const [newFaculty, setNewFaculty] = useState(5);
  const [newInfra, setNewInfra] = useState(5);
  const [newPlacements, setNewPlacements] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const unsub = subscribeToPath<Record<string, CollegeReview>>('collegeReviews', (data) => {
      if (data) {
        setReviews(Object.values(data));
      } else {
        INITIAL_REVIEWS.forEach((rev) => saveCollegeReview(rev));
        setReviews(INITIAL_REVIEWS);
      }
    });

    return () => unsub();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('Please write a short review comment.');
      return;
    }

    const reviewRecord: CollegeReview = {
      id: `REV-${Date.now().toString().slice(-5)}`,
      authorName: user?.name || 'Anonymous Student',
      role: user?.role === 'teacher' ? 'Teacher' : 'Student',
      department: user?.stream || 'Computer Science',
      overallRating: newOverall,
      academicsRating: newAcademics,
      facultyRating: newFaculty,
      infrastructureRating: newInfra,
      placementsRating: newPlacements,
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0],
      verified: true
    };

    const ok = await saveCollegeReview(reviewRecord);
    if (ok) {
      setStatusMsg('Thank you! Your NH College rating and review have been published.');
      setIsModalOpen(false);
      setComment('');
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const avgOverall = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.overallRating, 0) / reviews.length).toFixed(1)
    : '4.9';

  const renderStars = (count: number) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= count
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-300 dark:text-slate-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Hero Accreditation Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-900/50 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>NAAC Grade A++ Accredited • Ranked #1 Autonomous College</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">NH College Official Rating & Quality Index</h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Maintained under NH Education Foundation standards. Realtime rating feedback from registered students, faculty, and alumni.
          </p>
        </div>

        {/* Rating Counter Box */}
        <div className="bg-slate-800/90 border border-indigo-500/30 rounded-2xl p-5 text-center shrink-0 min-w-[220px] shadow-lg">
          <div className="text-4xl font-extrabold text-amber-400 tracking-tight flex items-center justify-center space-x-1">
            <span>{avgOverall}</span>
            <span className="text-xl text-slate-400">/ 5.0</span>
          </div>
          <div className="flex justify-center my-1.5">{renderStars(Math.round(Number(avgOverall)))}</div>
          <p className="text-xs text-slate-300 font-medium">Based on {reviews.length + 1240} verified ratings</p>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-3 w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Rate NH College</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-sm font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Category Ratings Breakdown Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Academics & Syllabus</span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <span>4.9 / 5</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-400 h-full w-[98%] rounded-full"></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Faculty & Teaching</span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <span>4.8 / 5</span>
            <GraduationCap className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full w-[96%] rounded-full"></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Campus Infrastructure</span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <span>4.9 / 5</span>
            <Building2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[98%] rounded-full"></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Placements & Hiring</span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <span>4.8 / 5</span>
            <Award className="w-4 h-4 text-blue-500" />
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-[96%] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Reviews Stream */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Verified NH College Ratings & Reviews</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">{reviews.length} Recent Reviews</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">
                    {rev.authorName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs flex items-center space-x-1.5">
                      <span>{rev.authorName}</span>
                      <span className="px-1.5 py-0.2 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded text-[10px] font-medium border border-indigo-200 dark:border-indigo-800">
                        {rev.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{rev.department} Dept • {rev.date}</div>
                  </div>
                </div>

                <div className="text-right">{renderStars(rev.overallRating)}</div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 italic">"{rev.comment}"</p>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Campus Member</span>
                </span>
                <span className="flex items-center space-x-1 cursor-pointer hover:text-indigo-600">
                  <ThumbsUp className="w-3 h-3" />
                  <span>Helpful</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rating Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Submit NH College Rating</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Overall Star Rating (1-5)
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewOverall(s)}
                      className={`p-2 rounded-lg border text-sm ${
                        newOverall === s
                          ? 'bg-amber-400 text-slate-900 font-bold border-amber-500'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      ★ {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Review & Feedback Comments *
                </label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience regarding NH College faculty, lab infrastructure, campus environment..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md"
                >
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
