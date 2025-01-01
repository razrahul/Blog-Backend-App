import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../Utils/errorHandler.js";
import { Company } from "../models/company.models.js";

// Create Company
export const createCompany = catchAsyncError(async (req, res, next) => {
  const { companyName, companyId } = req.body;

  if (!companyName) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  // / Check if a Company with the given companyName exists
  const existingCompany = await Company.findOne({ companyName });
  if (existingCompany) {
    // if isdeleted is false, then the Company already exists
    if (!existingCompany.isdelete) {
      return next(new ErrorHandler("Company Already Exist", 409));
    } else {
      //if isdeleted is true, then reactivate the role || means isdeleted: true and updateBy : req.user._id
      // Reactivate the existing role
      (existingCompany.isdelete = false),
        (existingCompany.updatedBy = req.user._id);

      await existingCompany.save();

      res.status(201).json({
        success: true,
        message: "Company reactivated successfully",
        company: existingCompany,
      });
    }
  }

  const newCompany = await Company.create({
    companyName,
    companyId,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Company created successfully",
    company: newCompany,
  });
});

// Get All Companies
export const getAllCompanies = catchAsyncError(async (req, res, next) => {
  const companies = await Company.find({ isdelete: false }).sort({
    companyName: 1,
  });

  res.status(200).json({
    success: true,
    companies,
  });
});

// Get All Delted Cpmpanies
export const getAllDeletdCompanies = catchAsyncError(async (req, res, nest) => {
  const companies = await Company.find({ isdelete: true }).sort({
    companyName: 1,
  });

  res.status(201).json({
    success: true,
    companies,
  });
});

// Get Company by ID
export const getCompanyById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const company = await Company.findById(id);
  if (!company) return next(new ErrorHandler("Company not found", 404));

  if (company.isdelete) {
    return next(new ErrorHandler("Company not found", 404));
  }

  res.status(200).json({
    success: true,
    company,
  });
});

// Update Company
export const updateCompany = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { companyName, companyId } = req.body;

  let company = await Company.findById(id);
  if (!company) return next(new ErrorHandler("Company not found", 404));

  if (company.isdelete) return next(new ErrorHandler("Company not found", 404));

  company.companyName = companyName || company.companyName;
  company.companyId = companyId || company.companyId;
  company.updatedBy = req.user._id;

  await company.save();

  res.status(200).json({
    success: true,
    message: "Company updated successfully",
    company,
  });
});

// Delete Company
export const deleteCompany = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let company = await Company.findById(id);
  if (!company) return next(new ErrorHandler("Company not found", 404));

  if (company.isdelete) return next(new ErrorHandler("Company not found", 404));

  company.deletedBy = req.user._id;
  company.isdelete = true;

  await company.save();

  res.status(200).json({
    success: true,
    message: "Company deleted successfully",
  });
});

// Change Activity Status
export const changeCompanyActivity = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let company = await Company.findById(id);
  if (!company) return next(new ErrorHandler("Company not found", 404));

  if (company.isdelete) return next(new ErrorHandler("Company not found", 404));

  company.isactive = !company.isactive;
  company.updatedBy = req.user._id;

  await company.save();

  res.status(200).json({
    success: true,
    message: "Company activity status updated successfully",
    company,
  });
});
