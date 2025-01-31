const merchantModel = require(`../models/NewmarChModel`);
const productModel = require(`../models/ProductModel`);
const userModel = require(`../models/userModel`)
const cloudinary = require(`../untils/cloudinary`);
const mongoose = require(`mongoose`)
const fs = require(`fs`);
const path = require('path');
const catergoryModel = require("../models/categoryModel")

const formatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 2
});

// Create a new product
// const createProduct = async (req, res) => {
//   try {
//     const { productName, productPrice, productDescription } = req.body;
//     const file = req.files.productImage;

//     if (!productName || !productPrice || !productDescription) {
//       return res.status(400).json({ message: "Please enter all fields." });
//     }

//     const { merchantId} = req.params;
//     if (!mongoose.Types.ObjectId.isValid(merchantId)) {
//         return res.status(400).json({ message: 'Invalid ID format.' });}
//     const merchantStore = await merchantModel.findById(merchantId);

//     if (!merchantStore) {
//       return res.status(401).json("Store is not currently online.");
//     }

//     const image = await cloudinary.uploader.upload(file.tempFilePath);
//     fs.unlink(file.tempFilePath, (err) => {
//       if (err) {
//         console.log("Failed to delete the file locally:", err);
//       }
//     });

//     const newProduct = await productModel.create({
//       merchant: merchantId,
//       productName,
//       merchantName: merchantStore.businessName,
//       merchantDescription: merchantStore.description,
//       productPrice,
//       productDescription,
//       productImage: image.secure_url,
//       email: merchantStore.email
//     });

//     merchantStore.products.push(newProduct._id);

//     await merchantStore.save();

//     res.status(201).json({
//       message: "New Product created successfully.",
//       data: newProduct,
//     });
//   } catch (error) {
//     res.status(500).json({message: error.message});
//   }
// }; 
const createProduct = async (req, res) => {
  try {
    const { productName, productPrice, productDescription } = req.body;
    const file = req.files.productImage;

    // Validate input fields
    if (!productName || !productPrice || !productDescription) {
      return res.status(400).json({ message: "Please enter all fields." });
    }

    // Validate merchant ID and category ID from params
    const { merchantId, categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(merchantId)) {
      return res.status(400).json({ message: 'Invalid merchant ID format.' });
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID format.' });
    }

    // Find the merchant store
    const merchantStore = await merchantModel.findById(merchantId);
    if (!merchantStore) {
      return res.status(401).json("Store is not currently online.");
    }

    // Find the category by ID
    const category = await catergoryModel.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: "Category not found." });
    }

    // Upload image to Cloudinary
    const image = await cloudinary.uploader.upload(file.tempFilePath);
    fs.unlink(file.tempFilePath, (err) => {
      if (err) {
        console.log("Failed to delete the file locally:", err);
      }
    });

    // Create the new product
    const newProduct = await productModel.create({
      merchant: merchantId,
      productName,
      merchantName: merchantStore.businessName,
      merchantDescription: merchantStore.description,
      productPrice,
      productDescription,
      productImage: image.secure_url,
      email: merchantStore.email,
      category: categoryId  // Associate product with category from params
    });

    // // Add the product to the merchant's product list
    // merchantStore.products.push(newProduct._id);
    // await merchantStore.save();

    // // Add the product to the category's product list
    // category.products.push(newProduct._id);
    // await category.save();
    if (!Array.isArray(merchantStore.products)) {
      merchantStore.products = [];
    }
    merchantStore.products.push(newProduct._id);
    await merchantStore.save();

    if (!Array.isArray(category.products)) {
      category.products = [];
    }
    category.products.push(newProduct._id);
    await category.save();


    res.status(201).json({
      message: "New Product created successfully.",
      data: newProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get a single product by ID
const getOneProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Invalid ID format.' });}
    const product = await productModel.findById(productId).populate('merchant');
    // const product2 = await catergoryModel.findById( productId ).populate('category')
    if (!product ) {
      return res.status(404).json('Product not found.');
    }
    res.status(200).json({
      message: `Product found`,
      data: product,
    });
  } catch (error) {
    res.status(500).json({message: error.message});
  }finally {
    // Always attempt to delete the temp file after upload
    if (req.files?.productImage?.tempFilePath) {
      fs.unlink(req.files.productImage.tempFilePath, (err) => {
        if (err) {
          console.log("Failed to delete the file locally:", err);
        }
      });
    }
  }
};

// Get all products for a specific store (merchant)
const getAllForOneStore = async (req, res) => {
  try {
    const { merchantId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(merchantId)) {
        return res.status(400).json({ message: 'Invalid ID format.' });}
    const merchantStore = await merchantModel.findById(merchantId).populate('products');
    if (!merchantStore) {
      return res.status(404).json("Store not found.");
    }
    res.status(200).json({
      message: `All products found.`,
      data: merchantStore.products, // Return only products
    });
  } catch (error) {
    res.status(500).json({message:error.message});
  }
};

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await productModel.find()
    if (products.length === 0) {
      return res.status(404).json("No products found.");
    }

    res.status(200).json({
      message: 'Products found.',
      data: products,
    });
  } catch (error) {
    res.status(500).json({message:error.message});
  }
};


const getTopProducts = async (req, res) => {
  try {
    // Fetch 9 products sorted by createdAt (newest first)
    const products = await productModel.find().sort({ createdAt: -1 }).limit(8);

    if (products.length === 0) {
      return res.status(404).json("No products found.");
    }

    res.status(200).json({
      message: 'Latest products found.',
      data: products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update a product by ID

const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Validate the product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid ID format.' });
    }

    const { productName, productPrice, productDescription } = req.body;

    // Check if the product exists
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let productImage = product.productImage; // Default to the existing image

    // Check if the new image file is uploaded
    if (req.files && req.files.productImage) {
      const file = req.files.productImage; // Accessing the uploaded file

      // Upload the new image to Cloudinary
      const uploadedImage = await cloudinary.uploader.upload(file.tempFilePath);

      // If product has an existing image, delete it from Cloudinary
      if (product.productImage) {
        await cloudinary.uploader.destroy(product.productImage);
      }

      // Update productImage with the new Cloudinary URL
      productImage = uploadedImage.secure_url;
    }

    // Update product fields
    const data = {
      productName: productName || product.productName,
      productPrice: productPrice || product.productPrice,
      productDescription: productDescription || product.productDescription,
      productImage: productImage, // Updated image or existing one
    };

    // Save the updated product in the database
    const updatedProduct = await productModel.findByIdAndUpdate(productId, data, { new: true });

    // Respond with the updated product details
    res.status(200).json({ message: "Product updated successfully", data: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete a product by ID
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Invalid ID format.' });}
    // Find the product to delete
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json("Product not found.");
    }

    // Find the associated merchant and remove the product from their products list
    const merchantId = product.merchant;
    if (merchantId) {
      const merchant = await merchantModel.findById(merchantId);
      if (merchant) {
        // Remove the product's ObjectId from the merchant's products array
        merchant.products = merchant.products.filter(
          (prodId) => prodId.toString() !== productId
        );
        await merchant.save(); // Save the updated merchant
      }
    }

    // Delete the product
    await productModel.findByIdAndDelete(productId);

    // Delete the product image from Cloudinary
    const imagePublicId = product.productImage.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(imagePublicId);

    res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};


const searchProducts = async (req, res) => {
    try {
        const { searchTerm } = req.body;

        if (!searchTerm) {
            return res.status(400).json({ message: "Please enter a search term" });
        }

        // Find products where the productName matches the search term (case-insensitive)
        const products = await productModel.find({
            productName: { $regex: searchTerm, $options: 'i' }
        });

        if (products.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }

        res.status(200).json({
            message: "Products retrieved successfully",
            data: products
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const saveProductForLater = async (req, res) => {
  try {
      const {userId} = req.user
      const productId = req.body.productId; 

      // Find the user
      const user = await userModel.findById(userId);

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Find the product
      const product = await productModel.findById(productId);
      if (!product) {
          return res.status(404).json({ message: 'Product not found' });
      }

      // Check if the product is already saved
      const isSaved = user.savedProducts.includes(productId);

      if (isSaved) {
          // If the product is already saved, unsave it (remove from list)
          user.savedProducts = user.savedProducts.filter(id => id.toString() !== productId);
      } else {
          // If not saved, add it to the savedProducts list
          user.savedProducts.push(productId);
      }

      // Save the updated user document
      await user.save();

      res.status(200).json({
          message: isSaved ? 'Product removed from saved list' : 'Product saved for later',
          savedProducts: user.savedProducts
      });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getOneProduct,
  getAllForOneStore,
  getAllProducts,
  getTopProducts,
  updateProduct,
  deleteProduct,
  searchProducts,
  saveProductForLater,
};

