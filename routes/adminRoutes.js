import  express from 'express'
import { register } from '../controllers/adminController.js';
import { login } from '../controllers/adminController.js';
import { logout } from '../controllers/adminController.js';

const router = express.Router()

//register
router.route('/register').post(register)

//login
router.route('/login').post(login)

//logout
router.route("/logout").get(logout)



export default router;