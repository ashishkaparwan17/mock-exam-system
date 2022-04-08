import React from 'react'
import notfoundimage from '../assets/404.png'
import styles from './NotFound.module.css'

const NotFound = () => {
  return (
    <div className={styles.container}>
      <img className={styles.image} alt="Not found" src={notfoundimage} />
      <p className="fw-bold h3 text-white mt-3">404 · Page not found</p>
    </div>
  )
}

export default NotFound