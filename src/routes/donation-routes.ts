// @ts-nocheck
import { Router } from 'express';
import { DonationController } from '../controllers/donation-controller';

const router = Router();

// 📊 Dashboard Routes
router.get('/dashboard/stats', DonationController.getDashboardStats);

// 🍕 Donation Management Routes (Business)
router.post('/donations', DonationController.createDonation);
router.get('/donations/my', DonationController.getMyDonations);
router.get('/donations/browse', DonationController.browseDonations);

// 📋 Request Management Routes (Charity/Individual)
router.post('/requests', DonationController.createDonationRequest);
router.get('/requests/my', DonationController.getMyRequests);
router.get('/requests/browse', DonationController.browseRequests);

// 🤝 Matching Routes
router.post('/matches', DonationController.createMatch);
router.put('/matches/:matchId/status', DonationController.updateMatchStatus);
router.get('/matches/my', DonationController.getMyMatches);

// ⭐ Review Routes
router.post('/reviews', DonationController.createReview);

// 🎯 Campaign Routes
router.post('/campaigns', DonationController.createCampaign);
router.get('/campaigns', DonationController.getCampaigns);
router.post('/campaigns/donate', DonationController.donateToCampaign);

export default router; 