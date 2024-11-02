import mongoose from 'mongoose';

const productSchema =new mongoose.Schema({
    name:{
        type: String,
    },
    description: {
        type: String,
    },
    price:{
        type: Number,
        min:0,
    },
    image:{
        type:String,
    },
    category:{
        type :String,
    },
    isFeatured:{
        type : Boolean,
        default:false
    }
},{timeseries: true});

const Product= mongoose.model("Product", productSchema);
export default Product
