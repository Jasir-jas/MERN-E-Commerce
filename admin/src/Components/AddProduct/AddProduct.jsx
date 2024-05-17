import React, { useState } from 'react'
import './AddProduct.css'
import upload_area from '../../assets/upload_area.svg'
import Loading from '../Loading/Loading'
// import Loading from '../../Components/Loading/Loading'




function AddProduct() {

  // this is for image dispaly in upload section
  const [image, setImage] = useState(false)
  const imageHandler = (e) => {
    
    setImage(e.target.files[0])
  }

  // Getting Product details from the Frontend
  const [productDetails, setProductDetails] = useState({
    name: "",
    image: "",
    category: "",
    new_price: "",
    old_price: ""
  })

  // Error,Success Message
  const [messsage, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value })
  }

  // Add product Button function
  const Add_Product = async () => {
    console.log(productDetails);

      setLoading(true)
    
    
    setMessage('')
    // store the response data received from the server after making the HTTP request.
    let responseData;

    let product = productDetails;

    let formData = new FormData();
    formData.append('product', image)

    await fetch('http://localhost:4000/upload', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    }).then((resp) => resp.json())

      // parse data
      .then((data) => { responseData = data })
    console.log(responseData);

    if (responseData.success) {
      product.image = responseData.image_url

      // product add in database
      await fetch('http://localhost:4000/addproduct', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      }).then((resp) => resp.json()).then((data) => {

        // use turnery operator
        setMessage(data.success ? 'Product Successfully Added' : 'Failed')

        // message hide after 3 seconds
        setTimeout(() => {
          setMessage('')
        }, 2000)
      })
      setLoading(false)
    } else {
      setMessage('Failed to Add Product')
      setTimeout(() => {
        setMessage('')
      }, 2000)
    }
  }



  return (
    loading ? (<Loading/>) : (
    <div className='add-product'>
      <div className="addproduct-itemfield">
        <p>Product Title</p>
        <input value={productDetails.name} onChange={changeHandler} type="text" name='name' placeholder='Type here..' />
      </div>

      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input value={productDetails.old_price} onChange={changeHandler} type="number" name='old_price' placeholder='Type here..' />
        </div>

        <div className="addproduct-itemfield">
          <p>Offer Price</p>
          <input value={productDetails.new_price} onChange={changeHandler} type="number" name='new_price' placeholder='Type here..' />
        </div>
      </div>

      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select value={productDetails.category} onChange={changeHandler} name="category" className='addproduct-selector' >
          <option value="" selected>SELECT</option>
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kid">Kid</option>
        </select>
      </div>

      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
          <img src={image ? URL.createObjectURL(image) : upload_area} className='addproduct-thumbnail-img' alt="" />
        </label>

        <input onChange={imageHandler} type="file" name='image' id='file-input' hidden />
      </div>
      <button onClick={() => { Add_Product() }} className='addproduct-btn'>ADD</button>

      {
        messsage && <div className='message'>
          {messsage}
        </div>
      }
      
    </div>
    
    )
  )
}


export default AddProduct
