import React from 'react'
import {BeatLoader} from 'react-spinners'
import './Loading.css'

function Loading() {
  return (
    <div className='loading-container'>
        <BeatLoader color='#36d7b7' size={50}/> 
    </div>
  )
}

export default Loading
