import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ReviewService } from '../services/reviewService';
import { getDb } from '../config/database';

const getReviewService = () => {
  const db = getDb();
  return new ReviewService(db);
};

// Review Platform Management
export const getPlatforms = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const reviewService = getReviewService();

    const platforms = await reviewService.getPlatforms(userId);
    res.json(platforms);
  } catch (error: any) {
    console.error('Get platforms error:', error);
    res.status(500).json({ error: error.message || 'Failed to get platforms' });
  }
};

export const addPlatform = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { platform_name, platform_url, api_key, place_id, settings } = req.body;

    if (!platform_name) {
      return res.status(400).json({ error: 'Platform name is required' });
    }

    const reviewService = getReviewService();
    const platform = await reviewService.addPlatform(
      userId,
      platform_name,
      platform_url,
      api_key,
      place_id,
      settings
    );

    res.status(201).json(platform);
  } catch (error: any) {
    console.error('Add platform error:', error);
    res.status(500).json({ error: error.message || 'Failed to add platform' });
  }
};

export const updatePlatform = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const updates = req.body;

    const reviewService = getReviewService();
    const platform = await reviewService.updatePlatform(id, userId, updates);

    if (!platform) {
      return res.status(404).json({ error: 'Platform not found' });
    }

    res.json(platform);
  } catch (error: any) {
    console.error('Update platform error:', error);
    res.status(500).json({ error: error.message || 'Failed to update platform' });
  }
};

export const deletePlatform = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const reviewService = getReviewService();
    await reviewService.deletePlatform(id, userId);

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete platform error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete platform' });
  }
};

// Review Management
export const getReviews = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const {
      platform_id,
      min_rating,
      max_rating,
      is_replied,
      is_flagged,
      limit,
      offset,
      start_date,
      end_date
    } = req.query;

    const reviewService = getReviewService();
    const reviews = await reviewService.getReviews(userId, {
      platform_id: platform_id as string,
      min_rating: min_rating ? parseFloat(min_rating as string) : undefined,
      max_rating: max_rating ? parseFloat(max_rating as string) : undefined,
      is_replied: is_replied === 'true' ? true : is_replied === 'false' ? false : undefined,
      is_flagged: is_flagged === 'true' ? true : is_flagged === 'false' ? false : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
      start_date: start_date ? new Date(start_date as string) : undefined,
      end_date: end_date ? new Date(end_date as string) : undefined
    });

    res.json(reviews);
  } catch (error: any) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: error.message || 'Failed to get reviews' });
  }
};

export const getReview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const reviewService = getReviewService();
    const review = await reviewService.getReviewById(id, userId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(review);
  } catch (error: any) {
    console.error('Get review error:', error);
    res.status(500).json({ error: error.message || 'Failed to get review' });
  }
};

export const addReview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const reviewData = req.body;

    if (!reviewData.reviewer_name || reviewData.rating === undefined) {
      return res.status(400).json({ error: 'Reviewer name and rating are required' });
    }

    if (reviewData.rating < 0 || reviewData.rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 0 and 5' });
    }

    const reviewService = getReviewService();
    const review = await reviewService.addReview(userId, {
      ...reviewData,
      review_date: reviewData.review_date ? new Date(reviewData.review_date) : new Date()
    });

    res.status(201).json(review);
  } catch (error: any) {
    console.error('Add review error:', error);
    res.status(500).json({ error: error.message || 'Failed to add review' });
  }
};

export const updateReview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const updates = req.body;

    const reviewService = getReviewService();
    const review = await reviewService.updateReview(id, userId, updates);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(review);
  } catch (error: any) {
    console.error('Update review error:', error);
    res.status(500).json({ error: error.message || 'Failed to update review' });
  }
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const reviewService = getReviewService();
    await reviewService.deleteReview(id, userId);

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete review' });
  }
};

// Analytics
export const getReviewStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { platform_id, start_date, end_date } = req.query;

    const reviewService = getReviewService();
    const stats = await reviewService.getReviewStats(userId, {
      platform_id: platform_id as string,
      start_date: start_date ? new Date(start_date as string) : undefined,
      end_date: end_date ? new Date(end_date as string) : undefined
    });

    res.json(stats);
  } catch (error: any) {
    console.error('Get review stats error:', error);
    res.status(500).json({ error: error.message || 'Failed to get review stats' });
  }
};

export const getReviewTrends = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { days, platform_id } = req.query;

    const reviewService = getReviewService();
    const trends = await reviewService.getReviewTrends(
      userId,
      days ? parseInt(days as string) : 30,
      platform_id as string
    );

    res.json(trends);
  } catch (error: any) {
    console.error('Get review trends error:', error);
    res.status(500).json({ error: error.message || 'Failed to get review trends' });
  }
};

// Utility
export const syncReviews = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { platform_id } = req.body;

    if (!platform_id) {
      return res.status(400).json({ error: 'Platform ID is required' });
    }

    const reviewService = getReviewService();
    const count = await reviewService.syncReviewsFromPlatform(userId, platform_id);

    res.json({ success: true, synced_count: count });
  } catch (error: any) {
    console.error('Sync reviews error:', error);
    res.status(500).json({ error: error.message || 'Failed to sync reviews' });
  }
};

export const generateSampleReviews = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { platform_id, count } = req.body;

    if (!platform_id) {
      return res.status(400).json({ error: 'Platform ID is required' });
    }

    const reviewService = getReviewService();
    await reviewService.generateSampleReviews(
      userId,
      platform_id,
      count ? parseInt(count) : 20
    );

    res.json({ success: true, message: 'Sample reviews generated' });
  } catch (error: any) {
    console.error('Generate sample reviews error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate sample reviews' });
  }
};
