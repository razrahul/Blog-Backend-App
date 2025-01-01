import express from 'express';
import { createCompany, getAllCompanies, getCompanyById, updateCompany, deleteCompany, changeCompanyActivity, getAllDeletdCompanies } from '../controllers/companyController.js';
import { isAuthenticatedUser, isAuthenticated, authorizeAdmin, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// Create Company
router.route('/company').post(isAuthenticated, createCompany);

// Get All Companies
router.route('/companies').get(isAuthenticated, getAllCompanies);

//Get All Delted Companies
router.route('/companies/deletd').get(isAuthenticated, getAllDeletdCompanies)

// Get Company by ID
router.route('/company/:id').get(isAuthenticated, getCompanyById);

// Update Company
router.route('/company/:id').put(isAuthenticated, updateCompany);

// Delete Company
router.route('/company/:id').delete(isAuthenticated, deleteCompany);

// Change Activity Status
router.route('/company/activity/:id').patch(isAuthenticated, changeCompanyActivity);

export default router;
