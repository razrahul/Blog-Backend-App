import { Admin } from "../models/Admin.js"
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { sendToken } from "../utils/sendToken.js";
import ErrorHandler from "../utils/errorHandler.js";

export const register = catchAsyncError( async(req, res , next) => {
    const { name, email, password } = req.body;

    const file = req.file;

    if(!name || !email || !password ) return next(new ErrorHandler("please enter All filed ", 400))
    
    let admin = await Admin.findOne({ email }) 
    if(admin) return next(new ErrorHandler("Admin Already Exist", 409))   
    // upload file on cloudanary 

    // const fileUri = getDataUri(file);

    // const myCloud = await cloudinary.uploader.upload(fileUri.content)


    admin = await  Admin.create({
         name, email, password,
        //  avatar:{
        //     public_id: myCloud.public_id,
        //     url: myCloud.secure_url,
        //  }
         })
    sendToken(res, admin, "Register Suessfully ",201)
})

//login controller

export const login = catchAsyncError( async(req, res, next) => {
    const { email, password } = req.body;

    if(!email || !password) return next(new ErrorHandler("please enter All filed ", 400))

    const admin = await Admin.findOne({ email }).select("+password")

    // console.log(admin);
    

    if(!admin) return next(new ErrorHandler("Invalid Email or Password", 401))

        //compare passward to hash password
    const isPasswordMatched = await admin.comparePassword(password)

    if(!isPasswordMatched) return next(new ErrorHandler("Invalid  Password", 401))


    // Compare passwords (plain-text comparison)
    // if (admin.password !== password) {
    //     return next(new ErrorHandler("Invalid email or only password", 401));
    // }
    


    // if(!isPasswordMatched ) return next(new ErrorHandler("Invalid  Password", 401))

    sendToken(res, admin, `Welcome Back, ${admin.name}`, 200)
})


export const logout = catchAsyncError( async(req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    res.status(200).json({
        success: true,
        message: "Logged Out suessfully",
    });
})

