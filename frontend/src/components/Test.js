import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import styles from './Test.module.css'
import { Form, Button } from 'react-bootstrap'
import Swal from 'sweetalert2'
import { useTimer } from 'use-timer';

// To store result of each question (correct or incorrect)
let result = {}

const Test = () => {

  // useLocation() returns an object with state property
  // We passed the state property to this component from Home.js
  // We used navigate('/test', { state: clickedTest }) there
  const clickedTest = useLocation().state

  // Find marks per question upto 2 decimal places
  const marks_per_question = (clickedTest.total_marks / clickedTest.number_of_questions).toFixed(2)

  const optionChangeHandler = (event, index) => {
    // Last index of id is the selected option number
    const optionNumber = parseInt(event.target.id.slice(-1))
    // Compare the selected option number with the correct
    // option number and store the result in result object
    if (optionNumber === clickedTest.questions[index].correct) {
      result[event.target.name] = "correct"
    } else {
      result[event.target.name] = "incorrect"
    }
  }

  // To show correct and incorrect feedback of every question after submission
  const [finalResult, setFinalResult] = useState({})
  // To show the unattempted feedback
  const [showUnattempted, setShowUnattempted] = useState(false)
  // To disable all options and the submit button after submission
  const [disable, setDisable] = useState(false)
  
  const { time, reset } = useTimer({
    initialTime: clickedTest.test_duration,
    autostart: true,
    // State will be updated after every interval
    // 60000 milliseconds is one minute
    interval: 60000,
    endTime: 0,
    timerType: 'DECREMENTAL',
    onTimeOver: () => {
      // Find count of 'correct' value in result keys
      let correct_responses = Object.values(result).filter(r => r === 'correct').length
      // Show the result
      Swal.fire({
        title: "Time's up!",
        icon: 'info',
        text: 'Your score is ' + Math.ceil(correct_responses * marks_per_question) + '/' + clickedTest.total_marks,
        showCancelButton: true,
        confirmButtonColor: '#c8303f',
        cancelButtonColor: '#0c6efd',
      })
      setFinalResult(result)
      setShowUnattempted(true)
      setDisable(true)
      result = {}
    }
  });

  const testSubmitHandler = (event) => {
    event.preventDefault()
    // Find count of 'correct' value in result keys
    let correct_responses = Object.values(result).filter(r => r === 'correct').length
    Swal.fire({
      title: 'Submit the test?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#c8303f',
      cancelButtonColor: '#0c6efd',
      confirmButtonText: 'Yes, Submit!',
      cancelButtonText: 'No, Do not submit!'
    }).then((res) => {
      if (res.isConfirmed) {
        // Reset the timer
        reset()
        // Show the result
        Swal.fire({
          title: 'Test score',
          icon: 'info',
          text: 'Your score is ' + Math.ceil(correct_responses * marks_per_question) + '/' + clickedTest.total_marks,
          showCancelButton: true,
          confirmButtonColor: '#c8303f',
          cancelButtonColor: '#0c6efd',
        })
        setFinalResult(result)
        setShowUnattempted(true)
        setDisable(true)
        result = {}
      }
    })
  }

  return (
    <>
      <Form className={styles.form} onSubmit={testSubmitHandler}>
        {clickedTest.questions.map((question, index) => (
          <div key={index} className={styles.card}>
            <Form.Group >
              <Form.Label><b> {question.title} </b></Form.Label>
              <Form.Check
                type="radio"
                disabled={disable}
                name={`question-${index + 1}`}
                value={question.a}
                onChange={e => optionChangeHandler(e, index)}
                // Make label clickable by adding unique id to all options of all questions
                id={`question-${index + 1}-option1`}
                label={question.a}
              />
              <Form.Check
                type="radio"
                disabled={disable}
                name={`question-${index + 1}`}
                value={question.b}
                onChange={e => optionChangeHandler(e, index)}
                id={`question-${index + 1}-option2`}
                label={question.b}
              />
              <Form.Check
                type="radio"
                disabled={disable}
                name={`question-${index + 1}`}
                value={question.c}
                onChange={e => optionChangeHandler(e, index)}
                id={`question-${index + 1}-option3`}
                label={question.c}
              />
              <Form.Check
                type="radio"
                disabled={disable}
                name={`question-${index + 1}`}
                value={question.d}
                onChange={e => optionChangeHandler(e, index)}
                id={`question-${index + 1}-option4`}
                label={question.d}
              />
            </Form.Group>
            {/* if `question-${index+1}` key exists in finalResult and it's value is "incorrect" */}
            {/* then show the feedback to the user as incorrect else show correct feedback */}
            {(`question-${index + 1}` in finalResult) &&
              finalResult[`question-${index + 1}`] === 'incorrect' &&
              <span className="fw-bold text-danger">INCORRECT</span>}
            {(`question-${index + 1}` in finalResult) &&
              finalResult[`question-${index + 1}`] === 'correct' &&
              <span className="fw-bold text-success">CORRECT</span>}
            {/* if `question-${index+1}` key does not exist in finalResult and the */}
            {/* test has been submitted then show the unattempted feedback to the user*/}
            {!(`question-${index + 1}` in finalResult) &&
              showUnattempted &&
              <span className="fw-bold text-danger">UNATTEMPTED</span>}
          </div>
        ))}
        <div className={styles.buttoncard}>
          <Button disabled={disable} variant="outline-primary" type="submit"> Submit test </Button>
        </div>
      </Form >
      <div className={styles.helper}>
        <div className={styles.timercard}>
          {time}<br />
          minutes<br />
          left
        </div>
      </div>
    </>
  )
}

export default Test