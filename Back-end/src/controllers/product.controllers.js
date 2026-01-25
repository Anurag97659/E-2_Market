import{asyncHandler}from '../utils/asyncHandler.js';
import{ApiError}from '../utils/ApiError.js';
import{ApiResponse}from '../utils/ApiResponse.js';
import dotenv from "dotenv";
import{uploadOnCloudinary}from '../utils/cloudinary.js';
import{Product}from '../models/product.model.js';
import{User}from '../models/user.model.js';
dotenv.config({
    path: "/.env"
});

const registerProduct=asyncHandler(async(req,res)=>{
    const{Title,Description,Price,Category,Quantity,Rating}=req.body;
    const userId=req.user._id;
    if(!userId){
        throw new ApiError(400,"User not found");
    }
    if(Title===""){
        throw new ApiError(400,"Title is required");
    }
    else if(Description===""){
        throw new ApiError(400,"Description is required");
    }
    else if(Price===""){
        throw new ApiError(400,"Price is required");
    }
    else if(Category===""){
        throw new ApiError(400,"Category is required");
    }
    else if(Quantity===""){
        throw new ApiError(400,"Quantity is required");
    }
    else if(Rating===""){
        throw new ApiError(400,"Rating is required");
    }

    if(!req.files || !req.files.Image || req.files.Image.length === 0){
        throw new ApiError(400,"Image is required");
    }
    
    
    const ImageLocalpath=req.files?.Image[0]?.path;
    if(!ImageLocalpath){
        throw new ApiError(400,"Image is required");
    }
    const Image=await uploadOnCloudinary(ImageLocalpath);
    if(!Image){
        throw new ApiError(500,"Image upload failed");
    }

    const product=await Product.create({
        Title,
        Description,
        Price,
        Category,
        Quantity,
        Rating,
        Owner: userId,
        Client: null, 
        Image: Image.secure_url,
    })
    const createProduct=await Product.findById(product._id);
    if(!createProduct){
        throw new ApiError(500,"product creation failed due to some internal problem")
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            createProduct,
            "product created successfully"
        )
    )

});

const updateProduct=asyncHandler(async(req,res)=>{
    const{Title,Description,Price,Category,Quantity,Rating }= req.body;
    const{productId}= req.params; 

    if(!productId){
        throw new ApiError(400,"Product not found");
    }

    if(!Title && !Description && !Price && !Category && !Quantity && !Rating){
        throw new ApiError(400,"At least one field is required to update");
    }

    const userId=req.user._id;
    if(!userId){
        throw new ApiError(400,"User not found");
    }

    const product=await Product.findOneAndUpdate(
       {_id:productId,Owner:userId},
       {
            $set:{Title,Description,Price,Category,Quantity,Rating},
        },
       {new:true}
    );

    if(!product){
        throw new ApiError(500,"Product update failed due to an internal problem");
    }

    return res.status(200).json(new ApiResponse(200, product,"Product updated successfully"));
});

const updateImage=asyncHandler(async(req,res)=>{
    const{productId}= req.params; 
    const userId=req.user._id;

    if(!userId){
        throw new ApiError(400,"User not found");
    }
    if(!productId){
        throw new ApiError(400,"Product not found");
    }
    if(!req.files || !req.files.Image || req.files.Image.length === 0){
        throw new ApiError(400,"Image is required");
    }

    const ImageLocalpath=req.files.Image[0]?.path;
    if(!ImageLocalpath){
        throw new ApiError(400,"Image is required");
    }
    const Image=await uploadOnCloudinary(ImageLocalpath);
    if(!Image){
        throw new ApiError(500,"Image upload failed");
    }
    const product=await Product.findOneAndUpdate(
       {_id:productId,Owner:userId },
       {$set:{Image:Image.secure_url}},
       {new:true}
    );

    if(!product){
        throw new ApiError(500,"Product image update failed due to an internal problem");
    }

    return res.status(200).json(
        new ApiResponse(200,product,"Product image updated successfully")
    );
});

const deleteProduct=asyncHandler(async(req,res)=>{
    const userId=req.user._id;
    const{productId}= req.body; 

    if(!userId){
        throw new ApiError(400,"User not found");
    }
    if(!productId){
        throw new ApiError(400,"Product not found");
    }

    const productOwner=await Product.findOne({_id:productId}).select("Owner");
    if(!productOwner){
        throw new ApiError(404,"Product not found");
    }

    if(userId.toString()!== productOwner.Owner.toString()){
        throw new ApiError(403,"You are not authorized to delete this product");
    }

    const product=await Product.findOneAndDelete({_id:productId,Owner:userId });
    if(!product){
        throw new ApiError(500,"Product deletion failed due to an internal problem");
    }

    return res.status(200).json(new ApiResponse(200,product,"Product deleted successfully"));
});

const sell=asyncHandler(async(req,res)=>{
    const userId=req.user._id;
    if(!userId){
        throw new ApiError(400,"User not found");
    }
    const product=await Product.find({Owner:userId});
    if(!product){
        throw new ApiError(500,"product not found due to some internal problem")
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            product,
            "product found successfully"
        )
    )

});

// const search=asyncHandler(async(req,res)=>{
//     const{ search }= req.query;
//     if(!search){
//         throw new ApiError(400,"Search query is required");
//     }

//     const products=await Product.find({
//         $or: [
//            { Title:{ $regex: search, $options: "i" }},
//            { Description:{ $regex: search, $options: "i" }},
//            { Category:{ $regex: search, $options: "i" }},
//         ],
//     });

//     if(!products){
//         throw new ApiError(404,"No products found");
//     }

//     return res.status(200).json(
//         new ApiResponse(200, products,"Products found successfully")
//     );
// });

const search=asyncHandler(async(req,res)=>{
    const{search,category,minPrice,maxPrice,sortBy,sortOrder }=req.query;
    if(!search){
        throw new ApiError(400,"Search query is required");}
        
    let filter={
        $or:[
           {Title:{$regex:search,$options:"i"}},
           {Description:{$regex:search,$options:"i"}},
           {Category:{$regex:search,$options:"i" }},
        ],
    };

    if(category){filter.Category=category;}
    if(minPrice){filter.Price ={ ...filter.Price,$gte:minPrice };}
    if(maxPrice){filter.Price ={ ...filter.Price,$lte:maxPrice };}
    let sort ={};
    if(sortBy){sort[sortBy]=sortOrder==='desc'? -1:1;}
    const products=await Product.find(filter).sort(sort);
    if(!products){throw new ApiError(404,"No products found");}

    return res.status(200).json(
        new ApiResponse(200, products,"Products found successfully")
    );
});

const addToCart=asyncHandler(async(req,res)=>{
    const{productId}=req.body;
    const userId=req.user._id; 

    if(!productId){
        throw new ApiError(400,"Product ID is required");
    }
    const product=await Product.findById(productId);
      
    if(!product){
        throw new ApiError(404,"Product not found");
    }
    // console.log("product data = ",product)
    if (String(product.Owner) === String(userId)) {
        throw new ApiError(400, "You cannot add your own product to the cart");
    }
    product.Client=userId;
    await product.save();
    const user = await User.findByIdAndUpdate(
        userId,
        {$addToSet:{cart:productId}},
        {new:true}
    );
    // console.log("after = ",product)
    res.status(200).json(
        new ApiResponse(200, user,"Product added to cart successfully")
    );
});

const removeFromCart=asyncHandler(async(req,res)=>{
    const{productId}= req.body;
    const userId=req.user._id;
    if(!productId)throw new ApiError(400,"Product ID is required");
    const product = await Product.findByIdAndUpdate(
        productId,
        {$unset: { Client: ""}},
        {new: true}
    );
    if(!product){
        throw new ApiError(404, "Product not found");
    }
    const user = await User.findByIdAndUpdate(
        userId,
        { $pull:{ cart: productId}}, 
        { new: true }
    );

    res.status(200).json(new ApiResponse(200, user, "Product removed from cart successfully"));
});

const getCartList=asyncHandler(async(req,res)=>{
    const userId=req.user._id;
    const user=await Product.find({Client:userId});
    if(!user)throw new ApiError(404,"User not found");
    res.status(200).json(new ApiResponse(200, user,"Cart list fetched successfully"));
});

const getproductdetailsforproductpage=asyncHandler(async(req,res)=>{
    const{productId}= req.params;
    if(!productId){
        throw new ApiError(400,"Product ID is required");
    }
    const product=await Product.findById(productId);
    if(!product){
        throw new ApiError(404,"Product not found");
    }
    res.status(200).json(new ApiResponse(200, product,"Product details fetched successfully"));
});
export{registerProduct,
    updateProduct,
    updateImage,
    deleteProduct,
    sell,
    search,
    addToCart,
    removeFromCart,
    getCartList,
    getproductdetailsforproductpage

};