import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

const demoReviews = {
  medicine: [
    {
      id: 1,
      user: 'Rajesh Kumar',
      rating: 5,
      date: '2 days ago',
      comment: 'Very effective for fever and body pain. Works within 30 minutes.',
      verified: true,
      helpful: 24
    },
    {
      id: 2,
      user: 'Priya Sharma',
      rating: 4,
      date: '1 week ago',
      comment: 'Good medicine but had mild side effects initially.',
      verified: true,
      helpful: 12
    },
    {
      id: 3,
      user: 'Arun Reddy',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Reliable brand. Always keeps in my first aid kit.',
      verified: false,
      helpful: 8
    }
  ],
  doctor: [
    {
      id: 1,
      user: 'Lakshmi N.',
      rating: 5,
      date: '3 days ago',
      comment: 'Very patient and explains everything clearly. Highly recommend!',
      verified: true,
      helpful: 45
    },
    {
      id: 2,
      user: 'Ramesh M.',
      rating: 4,
      date: '1 week ago',
      comment: 'Good doctor but long waiting time.',
      verified: true,
      helpful: 23
    }
  ],
  pharmacy: [
    {
      id: 1,
      user: 'Suresh P.',
      rating: 5,
      date: '1 day ago',
      comment: 'Fast delivery and genuine medicines. Great service!',
      verified: true,
      helpful: 18
    },
    {
      id: 2,
      user: 'Anita K.',
      rating: 4,
      date: '4 days ago',
      comment: 'Good stock availability but could improve packaging.',
      verified: true,
      helpful: 9
    }
  ]
};

export default function ReviewsSection({ type = 'medicine', averageRating = 4.5, totalReviews = 156 }) {
  const [expandedReview, setExpandedReview] = useState(null);
  const reviews = demoReviews[type] || demoReviews.medicine;

  const ratingDistribution = [
    { stars: 5, percentage: 65 },
    { stars: 4, percentage: 20 },
    { stars: 3, percentage: 10 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 2 },
  ];

  return (
    <div className="space-y-4">
      {/* Overall Rating */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
        <div className="flex items-start gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-800 mb-1">{averageRating.toFixed(1)}</div>
            <div className="flex items-center gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(averageRating)
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-600">{totalReviews} reviews</p>
          </div>

          <div className="flex-1 space-y-1">
            {ratingDistribution.map((item) => (
              <div key={item.stars} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-8">{item.stars}★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 w-10">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          {type === 'medicine' && 'Medicine ratings are based on user experiences and are not medical advice. Consult a doctor before use.'}
          {type === 'doctor' && 'Patient reviews are subjective experiences. Always verify doctor credentials independently.'}
          {type === 'pharmacy' && 'Pharmacy ratings are demo content for prototype purposes only.'}
        </p>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800">Recent Reviews</h4>
        {reviews.map((review, idx) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-xl p-4 border border-gray-100"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {review.user.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800">{review.user}</p>
                    {review.verified && (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{review.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < review.rating
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-3">{review.comment}</p>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600">
                <ThumbsUp className="w-3 h-3" />
                Helpful ({review.helpful})
              </button>
              {review.verified && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                  Verified User
                </Badge>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Demo Notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
        <p className="text-xs text-gray-600">
          📋 These are demonstration reviews. Real app would show actual user feedback.
        </p>
      </div>
    </div>
  );
}