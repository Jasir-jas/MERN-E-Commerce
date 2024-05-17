import React, { useEffect, useState } from 'react'
import './ListProduct.css'
import cross_icon from '../../assets/cross_icon.png'

function ListProduct() {

  const [allproducts, setAllProducts] = useState([])
  const [confirmRemoveId,setConfirmRemoveId] = useState(null)
  const [showMessage,setShowMessage] = useState(false)

  const fetchInfo = async () => {
    await fetch('http://localhost:4000/allproducts')
      .then((response) => response.json())
      .then((data) => { setAllProducts(data) })
  }

  useEffect(() => {
    fetchInfo()
  }, [])

  // Remove Product from this page

  const remove_product = async (id)=>{
    await fetch('http://localhost:4000/removeproduct',{
      method : 'POST',
      headers : {
        Accept : 'application/json',
        'Content-Type' : 'application/json',
      },
      body : JSON.stringify({id:id})
    })

    // After remove product updated product list
    await fetchInfo()
    setShowMessage(false)
  }
// confirm message for remove the product
const confirmRemove = (id)=>{
  setConfirmRemoveId(id)
  setShowMessage(true)
}

const cancelRemove = ()=>{
  setConfirmRemoveId(null)
  setShowMessage(false)
}

  return (
    <div className='list-product'>
      <h1>All Product List</h1>
      <div className="listproduct-format-main">
        <p>Product</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>REMOVE</p>
      </div>
      <hr />
      <div className="listproduct-allproduct">
        {allproducts.map((products, index) => {
          console.log('products:', products);
          return <> <div key={index} className="listproduct-format-main listproduct-format">

            <img src={products.image} alt="" className='listproduct-product-icon' />
            <p>{products.name}</p>
            <p>{products.old_price}</p>
            <p>{products.new_price}</p>
            <p>{products.category}</p>
            <img onClick={()=>{confirmRemove(products.id)}} className='crossicon-img' src={cross_icon} alt="" />
          </div>
            <hr />
          </>
        })}
      </div>

      {
        showMessage && (
          <div className="confirm-message">
            <p>Are you sure you want to remove this product?</p>
            <button onClick={()=>{remove_product(confirmRemoveId)}}>Yes</button>
            <button onClick={cancelRemove}>No</button>
          </div>
        )
      }

    </div>
  )
}

export default ListProduct
