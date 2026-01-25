import{Router} from 'express';
import {registerProduct,updateProduct,updateImage,deleteProduct,sell,search,addToCart,getCartList,removeFromCart, getproductdetailsforproductpage} from '../controllers/product.controllers.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';
import {upload} from '../middlewares/multer.middleware.js';

const router=Router();
router.route('/registerProduct').post(verifyJWT,upload.fields([
    {
        name:"Image",
        maxCount:1
    }
]),registerProduct);
router.route('/updateProduct/:productId').put(verifyJWT,updateProduct);
router.route('/updateImage/:productId').put(verifyJWT,upload.fields([{ name:"Image",maxCount:1}]),updateImage);
router.route('/deleteProduct').post(verifyJWT,deleteProduct);
router.route('/sell').get(verifyJWT,sell);
router.route('/search').get(verifyJWT,search);
router.post("/addToCart", verifyJWT, addToCart);
router.get("/getCartList", verifyJWT, getCartList);
router.post("/removeFromCart", verifyJWT, removeFromCart);
router.get("/getproductdetailsforproductpage/:productId", verifyJWT, getproductdetailsforproductpage);


export default router;