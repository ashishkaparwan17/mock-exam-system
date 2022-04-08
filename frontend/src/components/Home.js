import React, { useState, useContext, useEffect } from 'react'
import AuthContext from '../context/auth-context'
import styles from './Home.module.css'
import { Card, Button } from 'react-bootstrap'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import CircularProgress from '@mui/material/CircularProgress';

const Home = () => {

  const ctx = useContext(AuthContext)
  const navigate = useNavigate()
  const [loadedTests, setLoadedTests] = useState([])
  const [loadingSpinner, setLoadingSpinner] = useState(false)
  // Get all the tests in the tests collection
  useEffect(() => {
    const fetchTests = async () => {
      setLoadingSpinner(true)      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/gettests`)
      const data = await response.json()
      setLoadedTests(data.tests)
      setLoadingSpinner(false)
    }
    fetchTests()
  }, [])

  // Delete the test
  const deleteTestHandler = (testId) => {
    Swal.fire({
      title: 'Delete your test?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c8303f',
      cancelButtonColor: '#0c6efd',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const deleteTest = async (testId) => {
          setLoadingSpinner(true)
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/deletetest/${testId}`, {
            method: 'delete',
            body: null,
            headers: { authorization: ctx.token }
          })
          const data = await response.json()
          setLoadingSpinner(false)
          if (response.ok) {
            Swal.fire(
              'Deleted!',
              'Your test has been deleted.',
              'success'
            )
          } else {
            Swal.fire(
              data.message,
              'Unable to delete your test',
              'error'
            )
          }
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        }
        deleteTest(testId)
      }
    })
  }

  // Take test pin input from user and verify it
  const pinInputHandler = async (clickedTest) => {
    // console.log(clickedTest.test_pin)
    let { value: enteredPin } = await Swal.fire({
      title: 'Enter test pin',
      input: 'number',
    })
    // Converting string enteredPin into number enteredPin
    enteredPin = parseInt(enteredPin)
    if (!enteredPin) {
      // Do nothing if user didn't type anything
    } else if (enteredPin === clickedTest.test_pin) {
      // If user entered the correct pin then take 
      // final confirmation and start the test   
      Swal.fire({
        title: 'Start the test?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#c8303f',
        cancelButtonColor: '#0c6efd',
        confirmButtonText: 'Yes, Start!',
        cancelButtonText: 'No, I am not ready!'
      }).then((result) => {
        if (result.isConfirmed) {
          // navigate to test route and pass clickedTest as state
          // so that it can be accessed by useLocation() later
          navigate('/test', { state: clickedTest })
        }
      })
    } else if (enteredPin !== clickedTest.test_pin) {
      // If user entered incorrect pin show Swal error
      Swal.fire(
        'Wrong pin!',
        'Please enter the correct pin',
        'error'
      )
    }
  }

  return (
    <>
      {loadingSpinner && 
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress style={{ 'color': 'black'}} />
        </div>
      }
      {!ctx.token &&
        <div className={styles.card}>
          <h2 className={styles.center}> Please login to attempt a test! </h2>
        </div>
      }
      {ctx.token &&
        <div className={styles.card}>
          <h2 className={styles.center}> Welcome {ctx.name}!</h2>
        </div>
      }
      <div className={styles.container}>
        {loadedTests.map((test) => (
          <div className={styles.card} key={Math.random()}>
            <Card.Title>{test.test_name}</Card.Title>
            <Card.Text >
              Total marks: {test.total_marks}
              <br />
              Number of questions: {test.number_of_questions}
              <br />
              Duration: {test.test_duration} minutes
              <br />
              {(ctx.userId !== test.creator._id) && <b>Created by: {test.creator.name}</b>}
              {(ctx.userId === test.creator._id) && <b>Created by: You</b>}
              <br />
            </Card.Text>
            {/* If user is logged in and is not the creator of the test then show test pin swal */}
            {ctx.token && (ctx.userId !== test.creator._id) &&
              <Button variant="outline-primary" onClick={() => pinInputHandler(test)}>Attempt</Button>
            }
            {/* If the logged in user is the creator of the test then show delete button */}
            {(ctx.userId === test.creator._id) &&
              <Button variant="outline-danger" onClick={() => deleteTestHandler(test._id)}>Delete</Button>
            }
          </div>
        ))}
      </div>
    </>
  )
}

export default Home