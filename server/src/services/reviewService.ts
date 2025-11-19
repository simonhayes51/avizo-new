import { Pool } from 'pg';

interface ReviewPlatform {
  id: string;
  user_id: string;
  platform_name: string;
  platform_url?: string;
  api_key?: string;
  place_id?: string;
  is_active: boolean;
  settings: any;
}

interface Review {
  id: string;
  user_id: string;
  platform_id?: string;
  client_id?: string;
  external_review_id?: string;
  reviewer_name: string;
  reviewer_email?: string;
  rating: number;
  comment?: string;
  review_date: Date;
  reply_text?: string;
  reply_date?: Date;
  is_replied: boolean;
  is_read: boolean;
  is_flagged: boolean;
  sentiment?: string;
  tags: string[];
  metadata: any;
}

interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: { [key: number]: number };
  pending_replies: number;
  negative_reviews: number;
  recent_trend: 'up' | 'down' | 'stable';
  change_percentage: number;
}

export class ReviewService {
  private db: Pool;

  constructor(db: Pool) {
    this.db = db;
  }

  // Review Platform Management
  async addPlatform(
    userId: string,
    platformName: string,
    platformUrl?: string,
    apiKey?: string,
    placeId?: string,
    settings?: any
  ): Promise<ReviewPlatform> {
    try {
      const result = await this.db.query(
        `INSERT INTO review_platforms
         (user_id, platform_name, platform_url, api_key, place_id, settings)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, platformName, platformUrl, apiKey, placeId, settings || {}]
      );

      return result.rows[0];
    } catch (error: any) {
      console.error('Error adding review platform:', error);
      throw new Error(`Failed to add review platform: ${error.message}`);
    }
  }

  async getPlatforms(userId: string): Promise<ReviewPlatform[]> {
    try {
      const result = await this.db.query(
        'SELECT * FROM review_platforms WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );

      return result.rows;
    } catch (error: any) {
      console.error('Error fetching platforms:', error);
      throw new Error(`Failed to fetch platforms: ${error.message}`);
    }
  }

  async updatePlatform(
    platformId: string,
    userId: string,
    updates: Partial<ReviewPlatform>
  ): Promise<ReviewPlatform> {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (updates.platform_name !== undefined) {
        fields.push(`platform_name = $${paramCount++}`);
        values.push(updates.platform_name);
      }
      if (updates.platform_url !== undefined) {
        fields.push(`platform_url = $${paramCount++}`);
        values.push(updates.platform_url);
      }
      if (updates.api_key !== undefined) {
        fields.push(`api_key = $${paramCount++}`);
        values.push(updates.api_key);
      }
      if (updates.place_id !== undefined) {
        fields.push(`place_id = $${paramCount++}`);
        values.push(updates.place_id);
      }
      if (updates.is_active !== undefined) {
        fields.push(`is_active = $${paramCount++}`);
        values.push(updates.is_active);
      }
      if (updates.settings !== undefined) {
        fields.push(`settings = $${paramCount++}`);
        values.push(updates.settings);
      }

      fields.push(`updated_at = NOW()`);
      values.push(platformId, userId);

      const result = await this.db.query(
        `UPDATE review_platforms SET ${fields.join(', ')}
         WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
         RETURNING *`,
        values
      );

      return result.rows[0];
    } catch (error: any) {
      console.error('Error updating platform:', error);
      throw new Error(`Failed to update platform: ${error.message}`);
    }
  }

  async deletePlatform(platformId: string, userId: string): Promise<void> {
    try {
      await this.db.query(
        'DELETE FROM review_platforms WHERE id = $1 AND user_id = $2',
        [platformId, userId]
      );
    } catch (error: any) {
      console.error('Error deleting platform:', error);
      throw new Error(`Failed to delete platform: ${error.message}`);
    }
  }

  // Review Management
  async addReview(
    userId: string,
    reviewData: {
      platform_id?: string;
      client_id?: string;
      external_review_id?: string;
      reviewer_name: string;
      reviewer_email?: string;
      rating: number;
      comment?: string;
      review_date: Date;
      sentiment?: string;
      tags?: string[];
      metadata?: any;
    }
  ): Promise<Review> {
    try {
      const sentiment = reviewData.sentiment || this.analyzeSentiment(reviewData.rating, reviewData.comment);

      const result = await this.db.query(
        `INSERT INTO reviews
         (user_id, platform_id, client_id, external_review_id, reviewer_name, reviewer_email,
          rating, comment, review_date, sentiment, tags, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          userId,
          reviewData.platform_id || null,
          reviewData.client_id || null,
          reviewData.external_review_id || null,
          reviewData.reviewer_name,
          reviewData.reviewer_email || null,
          reviewData.rating,
          reviewData.comment || null,
          reviewData.review_date,
          sentiment,
          reviewData.tags || [],
          reviewData.metadata || {}
        ]
      );

      return result.rows[0];
    } catch (error: any) {
      console.error('Error adding review:', error);
      throw new Error(`Failed to add review: ${error.message}`);
    }
  }

  async getReviews(
    userId: string,
    options?: {
      platform_id?: string;
      min_rating?: number;
      max_rating?: number;
      is_replied?: boolean;
      is_flagged?: boolean;
      limit?: number;
      offset?: number;
      start_date?: Date;
      end_date?: Date;
    }
  ): Promise<Review[]> {
    try {
      let query = 'SELECT r.*, rp.platform_name FROM reviews r LEFT JOIN review_platforms rp ON r.platform_id = rp.id WHERE r.user_id = $1';
      const values: any[] = [userId];
      let paramCount = 2;

      if (options?.platform_id) {
        query += ` AND r.platform_id = $${paramCount++}`;
        values.push(options.platform_id);
      }

      if (options?.min_rating !== undefined) {
        query += ` AND r.rating >= $${paramCount++}`;
        values.push(options.min_rating);
      }

      if (options?.max_rating !== undefined) {
        query += ` AND r.rating <= $${paramCount++}`;
        values.push(options.max_rating);
      }

      if (options?.is_replied !== undefined) {
        query += ` AND r.is_replied = $${paramCount++}`;
        values.push(options.is_replied);
      }

      if (options?.is_flagged !== undefined) {
        query += ` AND r.is_flagged = $${paramCount++}`;
        values.push(options.is_flagged);
      }

      if (options?.start_date) {
        query += ` AND r.review_date >= $${paramCount++}`;
        values.push(options.start_date);
      }

      if (options?.end_date) {
        query += ` AND r.review_date <= $${paramCount++}`;
        values.push(options.end_date);
      }

      query += ' ORDER BY r.review_date DESC';

      if (options?.limit) {
        query += ` LIMIT $${paramCount++}`;
        values.push(options.limit);
      }

      if (options?.offset) {
        query += ` OFFSET $${paramCount++}`;
        values.push(options.offset);
      }

      const result = await this.db.query(query, values);
      return result.rows;
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      throw new Error(`Failed to fetch reviews: ${error.message}`);
    }
  }

  async getReviewById(reviewId: string, userId: string): Promise<Review | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM reviews WHERE id = $1 AND user_id = $2',
        [reviewId, userId]
      );

      return result.rows[0] || null;
    } catch (error: any) {
      console.error('Error fetching review:', error);
      throw new Error(`Failed to fetch review: ${error.message}`);
    }
  }

  async updateReview(
    reviewId: string,
    userId: string,
    updates: {
      reply_text?: string;
      is_replied?: boolean;
      is_read?: boolean;
      is_flagged?: boolean;
      tags?: string[];
    }
  ): Promise<Review> {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (updates.reply_text !== undefined) {
        fields.push(`reply_text = $${paramCount++}`);
        values.push(updates.reply_text);
        fields.push(`reply_date = NOW()`);
        fields.push(`is_replied = true`);
      }

      if (updates.is_replied !== undefined) {
        fields.push(`is_replied = $${paramCount++}`);
        values.push(updates.is_replied);
      }

      if (updates.is_read !== undefined) {
        fields.push(`is_read = $${paramCount++}`);
        values.push(updates.is_read);
      }

      if (updates.is_flagged !== undefined) {
        fields.push(`is_flagged = $${paramCount++}`);
        values.push(updates.is_flagged);
      }

      if (updates.tags !== undefined) {
        fields.push(`tags = $${paramCount++}`);
        values.push(updates.tags);
      }

      fields.push(`updated_at = NOW()`);
      values.push(reviewId, userId);

      const result = await this.db.query(
        `UPDATE reviews SET ${fields.join(', ')}
         WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
         RETURNING *`,
        values
      );

      return result.rows[0];
    } catch (error: any) {
      console.error('Error updating review:', error);
      throw new Error(`Failed to update review: ${error.message}`);
    }
  }

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    try {
      await this.db.query(
        'DELETE FROM reviews WHERE id = $1 AND user_id = $2',
        [reviewId, userId]
      );
    } catch (error: any) {
      console.error('Error deleting review:', error);
      throw new Error(`Failed to delete review: ${error.message}`);
    }
  }

  // Analytics and Statistics
  async getReviewStats(
    userId: string,
    options?: {
      platform_id?: string;
      start_date?: Date;
      end_date?: Date;
    }
  ): Promise<ReviewStats> {
    try {
      let query = 'SELECT * FROM reviews WHERE user_id = $1';
      const values: any[] = [userId];
      let paramCount = 2;

      if (options?.platform_id) {
        query += ` AND platform_id = $${paramCount++}`;
        values.push(options.platform_id);
      }

      if (options?.start_date) {
        query += ` AND review_date >= $${paramCount++}`;
        values.push(options.start_date);
      }

      if (options?.end_date) {
        query += ` AND review_date <= $${paramCount++}`;
        values.push(options.end_date);
      }

      const result = await this.db.query(query, values);
      const reviews = result.rows;

      // Calculate statistics
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0
        ? reviews.reduce((sum, r) => sum + parseFloat(r.rating), 0) / totalReviews
        : 0;

      const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach(r => {
        const rating = Math.round(parseFloat(r.rating));
        ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
      });

      const pendingReplies = reviews.filter(r => !r.is_replied && parseFloat(r.rating) < 4).length;
      const negativeReviews = reviews.filter(r => parseFloat(r.rating) < 3).length;

      // Calculate trend (compare last 30 days vs previous 30 days)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const recentReviews = reviews.filter(r => new Date(r.review_date) >= thirtyDaysAgo);
      const previousReviews = reviews.filter(
        r => new Date(r.review_date) >= sixtyDaysAgo && new Date(r.review_date) < thirtyDaysAgo
      );

      const recentAvg = recentReviews.length > 0
        ? recentReviews.reduce((sum, r) => sum + parseFloat(r.rating), 0) / recentReviews.length
        : 0;

      const previousAvg = previousReviews.length > 0
        ? previousReviews.reduce((sum, r) => sum + parseFloat(r.rating), 0) / previousReviews.length
        : 0;

      let recentTrend: 'up' | 'down' | 'stable' = 'stable';
      let changePercentage = 0;

      if (previousAvg > 0) {
        changePercentage = ((recentAvg - previousAvg) / previousAvg) * 100;
        if (changePercentage > 5) recentTrend = 'up';
        else if (changePercentage < -5) recentTrend = 'down';
      }

      return {
        total_reviews: totalReviews,
        average_rating: Math.round(averageRating * 10) / 10,
        rating_distribution: ratingDistribution,
        pending_replies: pendingReplies,
        negative_reviews: negativeReviews,
        recent_trend: recentTrend,
        change_percentage: Math.round(changePercentage * 10) / 10
      };
    } catch (error: any) {
      console.error('Error calculating review stats:', error);
      throw new Error(`Failed to calculate review stats: ${error.message}`);
    }
  }

  async getReviewTrends(
    userId: string,
    days: number = 30,
    platformId?: string
  ): Promise<Array<{ date: string; count: number; average_rating: number }>> {
    try {
      let query = `
        SELECT
          DATE(review_date) as date,
          COUNT(*) as count,
          AVG(rating) as average_rating
        FROM reviews
        WHERE user_id = $1
        AND review_date >= NOW() - INTERVAL '${days} days'
      `;

      const values: any[] = [userId];
      let paramCount = 2;

      if (platformId) {
        query += ` AND platform_id = $${paramCount++}`;
        values.push(platformId);
      }

      query += ' GROUP BY DATE(review_date) ORDER BY date DESC';

      const result = await this.db.query(query, values);
      return result.rows.map(row => ({
        date: row.date,
        count: parseInt(row.count),
        average_rating: Math.round(parseFloat(row.average_rating) * 10) / 10
      }));
    } catch (error: any) {
      console.error('Error fetching review trends:', error);
      throw new Error(`Failed to fetch review trends: ${error.message}`);
    }
  }

  // Helper Methods
  private analyzeSentiment(rating: number, comment?: string): string {
    if (rating >= 4) return 'positive';
    if (rating <= 2) return 'negative';
    return 'neutral';
  }

  async syncReviewsFromPlatform(userId: string, platformId: string): Promise<number> {
    // Placeholder for actual API integration
    // This would call Google Reviews API, Yelp API, etc.
    // For now, return 0 (no reviews synced)
    console.log(`Syncing reviews for platform ${platformId} - Integration pending`);
    return 0;
  }

  // Generate sample reviews for demonstration
  async generateSampleReviews(userId: string, platformId: string, count: number = 20): Promise<void> {
    const names = [
      'Sarah Johnson', 'Mike Chen', 'Emma Wilson', 'David Brown', 'Lisa Anderson',
      'James Taylor', 'Maria Garcia', 'Robert Lee', 'Jennifer White', 'Michael Davis',
      'Jessica Martinez', 'William Rodriguez', 'Ashley Lopez', 'Christopher Hill',
      'Amanda Green', 'Daniel King', 'Stephanie Wright', 'Matthew Scott'
    ];

    const positiveComments = [
      'Excellent service! Highly recommended.',
      'Very professional and friendly staff.',
      'Great experience, will definitely come back.',
      'Outstanding quality and attention to detail.',
      'Exceeded my expectations in every way.',
      'Fantastic service from start to finish.',
      'Very satisfied with the results.'
    ];

    const neutralComments = [
      'Good service overall.',
      'Met my expectations.',
      'Decent experience, nothing special.',
      'Average service, reasonable price.',
      'It was okay, could be better.'
    ];

    const negativeComments = [
      'Disappointed with the service.',
      'Did not meet expectations.',
      'Long wait time and poor communication.',
      'Not satisfied with the results.',
      'Would not recommend based on my experience.',
      'Service needs improvement.'
    ];

    for (let i = 0; i < count; i++) {
      const rating = Math.random() > 0.15 ? (Math.random() > 0.3 ? 5 : 4) : Math.random() > 0.5 ? 3 : Math.floor(Math.random() * 2) + 1;
      let comment;

      if (rating >= 4) {
        comment = positiveComments[Math.floor(Math.random() * positiveComments.length)];
      } else if (rating === 3) {
        comment = neutralComments[Math.floor(Math.random() * neutralComments.length)];
      } else {
        comment = negativeComments[Math.floor(Math.random() * negativeComments.length)];
      }

      const daysAgo = Math.floor(Math.random() * 90);
      const reviewDate = new Date();
      reviewDate.setDate(reviewDate.getDate() - daysAgo);

      await this.addReview(userId, {
        platform_id: platformId,
        reviewer_name: names[Math.floor(Math.random() * names.length)],
        rating,
        comment,
        review_date: reviewDate,
        external_review_id: `sample_${Date.now()}_${i}`
      });
    }
  }
}
