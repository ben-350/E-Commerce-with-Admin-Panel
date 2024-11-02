import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js"
import Product from "../models/product.model.js"

export const getAllProducts=async (req,res)=>{
try{
    const products=await Product.find({});
    res.json({products});
}catch(error){
console.log("Error in getAll  product controller", error.message);
res.status(500).json({message:"Server error", error:error.message});
}
}

export const getFeaturedProducts=async(req,res)=>{
    try {
        let featuredproducts =await redis.get("featured_products")
        if(featuredproducts){
            return res.json(JSON.parse(featuredproducts))
        }
        featuredproducts =await  Product.find({isFeatured:true}).lean();
        if(!featuredproducts){
            return res.status(404).json({message:"No featured product"})
        }
        await redis.set("featured_products", JSON.stringify(featuredproducts));
        res. json(featuredproducts);
    } catch (error) {
        console.log("Error in getFeaturedproducts controller", error.message);
        res.status(500).json({message:"Server error", error: error.message});
    }
};

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category } = req.body;
        const image = req.files?.image || req.body.image;
        
        console.log("Request body:", req.body);
        console.log("Files:", req.files);
        console.log("Image Check:", image);

        if (!name || !description || !price || !category) {
            return res.status(400).json({ 
                message: "Missing required fields",
                received: { name, description, price, category, hasImage: !!image }
            });
        }
        
        let cloudinaryResponse = null;
        
        if (image) {
            if (image.tempFilePath) {
                cloudinaryResponse = await cloudinary.uploader.upload(image.tempFilePath);
            } else if (typeof image === 'string' && image.startsWith('data:image')) {
                cloudinaryResponse = await cloudinary.uploader.upload(image);
            }
        }

        const product = await Product.create({
            name,
            description,
            price: Number(price),
            image: cloudinaryResponse?.secure_url || "",
            category
        });

        res.status(201).json(product);
    } catch (error) {
        console.log("Error in createProduct controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const deleteProduct=async(req,res)=>{
    try {
        const product=await Product.findById(req.params.id)
            if(!product){
                return res.status(401).json({message:"Product not found"})
            }
            if(product.image){
                const publicId=product.image.split("/").pop().split(".")[0];
                try {
                    await cloudinary.uploader.destroy(`products/${publicId}`)
                    console.log("deleted image from cloudinary");
                } catch (error) {
                    console.log("error deleting image from cloudinary", error);
                    
                }
            }
            await Product.findByIdAndDelete(req.params.id)
            res.json({message:"Product deleted successfully"});        
    } catch (error) {
        console.log("Error in deleting Product controller", error.message);
        res.status(500).json({message:"Server error", error:error.message});
        
        
    }
}

export const getRecomendedProducts=async(req,res)=>{
    try {
        const product=await Product.aggregate([
            {
                $sample:{size:3}
            },
            {
                $project:{
                    _id:1,
                    name:1,
                    description:1,
                    image:1,
                    price:1,

                }
            }
        ])
        res.json(product)
    } catch (error) {
        console.log("Error in getRecomendedProducts controller", error.message);
        res.status(500).json({message:"server error", error:error.message})
        
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const getProductsByCagegory=async(req,res)=>{
    const {category}=req.params;

    try {
        const  products=await Product.find({category});
        res.json(products);

    } catch (error) {
        console.log("Error in getProductsByCagegory", error.message);
        res.status(500).json({message:"Server error",error:error.message});
    }
}

export const toggleFeaturedProduct =async(req,res)=>{
    try {
        const product =await Product.findById(req.params.id);
        if(product){
            product.isFeatured=!product.isFeatured;
            const updatedProduct=await product.save(); 
            await updateFeaturedProductsCache();
            res.json(updatedProduct);
        }else{
            res.status(404).json({message:"Product not found"});
        }
    } catch (error) {
      console.log("Error in togglefeatureproduct controller", error.message);
      res.status(500).json({message:"Server error"})  
    }
}

async function updateFeaturedProductsCache() {
    try {
        const featuredproducts=await Product.find({isFeatured:true}).lean();
        await redis.set("featured_products", JSON.stringify(featuredproducts));
    } catch (error) {
        console.log("Error in updateCache function");
        
    }    
}