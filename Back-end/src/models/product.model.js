import mongoose,{Schema} from "mongoose";

const productSchema = new Schema({
    Title:{
        type:String,
        required:true,
        unique:false,
        minlength:3,
        index: true,
        lowercase:true,
        trim:true
    },
    Description:{
        type:String,
        required:true,
        unique:false,
        minlength:3,
        lowercase:true,
        trim:true
    },
    Price:{
        type: Number,
        required:true,
        minlength:1
    },
    Image:{
        type : String,
        required:true,
    },
    Category:{
        type : String,
        required:true,
        minlength:3,
        index:true,
        trim:true
    },
    Quantity:{
        type : Number,
        required:true,
        minlength:1,
        index:true,
        trim:true
    },
    Rating:{
        type : Number,
        // required:true,
        minlength:1,
        index:true,
        trim:true
    },
    Owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    Client:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }

},{timestamps:true});

export const Product = mongoose.model("Product",productSchema);
