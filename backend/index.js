const port = 4000;
const express = require('express');
const app = express();

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');
const path = require('path')

app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect('mongodb+srv://jasirvk:682782682782@cluster0.rhs6nfv.mongodb.net/ecommerce')

// API Creation
app.get('/',(req,res)=>{
    res.send('Express App is Running')
})

// image storage in folder

const storage = multer.diskStorage({
    destination : './upload/images',
    filename : (req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)

    }
})

// multer middleware 
const upload = multer({storage:storage})

// craeting upload endpoint for images

// static endpoint
app.use('/images',express.static('upload/images'))

app.post('/upload',upload.single('product'),(req,res)=>{
    res.json({
        success : 1,
        image_url : `http://localhost:${port}/images/${req.file.filename}`

    })
})

// Schema for craeting Products
const Product = mongoose.model('Product',{
    id : {
        type: Number,
        required:true,
    },
    name : {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required:true,
    },
    category: {
        type: String,
        required:true,
    },
    new_price: {
        type: Number,
        required:true,
    },
    old_price: {
        type: Number,
        required:true,
    },
    date : {
        type: Date,
        default: Date.now,
    },
    available: {
        type: Boolean,
        default: true,
    },
})

app.post('/addproduct', async(req,res)=>{
    let products = await Product.find({})  //All products available in products Array
    let id;
    
    if(products.length>0){
        let last_product_array = products.slice(-1)
        let last_product = last_product_array[0]
        id = last_product.id + 1 
    }
    else {
        id=1;
    }
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    })
    console.log(product);
    await product.save()
    console.log('Saved');

    res.json({
        success: true,
        name: req.body.name,
    })
})

// Creating API for Remove Product
app.post('/removeproduct', async(req,res)=> {
    await Product.findOneAndDelete({id:req.body.id})
    console.log('Removed');
    res.json({
        success: true,
        name: req.body.name
    })
})

// Creating API for Getting All Products

app.get('/allproducts',async(req,res)=>{
    let products = await Product.find({})
    console.log('All Products Fetching');
    res.send(products)
})

// schema models for users
const Users  = mongoose.model('Users',{
    name : {
        type : String,
    },
    email : {
        type : String,
        unique : true,
    },
    password : {
        type : String,
    },
    cartData : {
        type : Object,
    },
    date : {
        type : Date,
        default : Date.now,
    }
})

// Creating endpoint for registering users
app.post('/signup', async(req,res)=>{
    let check = await Users.findOne({email:req.body.email})
    if(check) {
        return res.status(400).json({success : false, errors : 'User Email already Exist'})
    }
    // Empty cart for new user after sign success
    let cart = {}
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }

    const user = new Users({
        name : req.body.username,
        email : req.body.email,
        password : req.body.password,
        cartData : cart,
    })
    await user.save()

    const data = {
        user : {
            id : user.id
        }
    }

    const token = jwt.sign(data,'secret_ecom') // secret_ecom is salt for encryption
    res.json({ success : true, token })
})

// creating enpoint for login user 
app.post('/login', async(req,res)=>{
    let user = await Users.findOne({ email : req.body.email})
    if (user) {
        let passCompare = await user.password === req.body.password
        if (passCompare) {
            const data = {
                user : {
                    id : user.id
                }
            }

            const token = jwt.sign(data, 'secret_ecom')
            res.json({ success : true, token})
        }else {
            res.json({ success : false , errors : 'Incorrect Password'})
        }

        
    }else {
        res.json({ success : false , errors : 'Wrong Email Id please check it'})
    }
})

// this endpoint for new collections

app.get('/newcollections', async(req,res)=> {
    let products = await Product.find({})
    let newcollections = products.slice(1).slice(-8)
    console.log("products are fetched");
    res.send(newcollections)
})

// endpoint for Popular in Women
app.get('/popularinwomen', async (req,res)=>{
    let products = await Product.find({category : "women"})
    let popular_in_women = products.slice(0,4)
    // console.log("popular in women products are fetched");
    res.send(popular_in_women)
})

// creating middleware to fetch user

const fetchData = async (req,res,next)=>{
    const token = req.header('auth-token')

    if(!token) {
        res.status(401).send({errors : 'please authenticate using valid token'})
    }
    else {
        try {
            const data = jwt.verify(token,'secret_ecom')
            req.user = data.user
            next()
        } catch (error) {
            res.status(401).send({errors : 'please authenticate using valid token'})
            
        }
    }
}

// creating endpoint for add product to cart data
app.post('/addtocart', fetchData, async (req,res)=>{
    // console.log(req.body,req.user);
    let userData = await Users.findOne({_id : req.user.id})
    userData.cartData[req.body.itemId] += 1
    await Users.findOneAndUpdate({_id : req.user.id},{cartData :  userData.cartData})
    res.send("Added")
})

// creating endpoint for remove item from cart data
 app.post('/removefromcart',fetchData,async (req,res)=>{
    let userData = await Users.findOne({_id : req.user.id})
    if(userData.cartData[req.body.itemId] > 0)
    userData.cartData[req.body.itemId] -= 1
    await Users.findOneAndUpdate({_id : req.user.id}, {cartData : userData.cartData})
    res.send("Removed")
 })

//  creating endpoint for get cartData
app.post('/getcart',fetchData, async (req,res)=>{
    console.log("CartData");
    let userData = await Users.findOne({ _id : req.user.id })
    res.json(userData.cartData)
})

app.listen(port,(error)=>{
    if(!error){
        console.log('Server is Running',+4000);
    }else{
        console.log('Error',+error);
    }

})
