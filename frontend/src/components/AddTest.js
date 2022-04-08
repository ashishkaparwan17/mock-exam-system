import React, { useContext, useState } from 'react'
import styles from './AddTest.module.css'
import { Form, Button, Alert } from 'react-bootstrap'
import AuthContext from '../context/auth-context'
import CircularProgress from '@mui/material/CircularProgress';

const AddTest = () => {

    const ctx = useContext(AuthContext);

    const [staticFormValues, setStaticFormValues] = useState({
        test_name: '',
        total_marks: '',
        test_duration: '',
        test_pin: ''
    })

    const staticInputChangeHandler = (event) => {
        setStaticFormValues((prevValues) => {
            return {
                ...prevValues,
                [event.target.name]: event.target.value
            }
        })
    }

    const [dynamicformValues, setDynamicFormValues] = useState({
        questions: []
    })

    const addQuestion = () => {
        setDynamicFormValues((prevValues) => {
            return {
                ...prevValues,
                questions: [
                    ...prevValues.questions,
                    {
                        title: '',
                        a: '', b: '', c: '', d: '',
                        correct: ''
                    }
                ]
            }
        })
    }

    const dynamicInputChangeHandler = (event, index) => {
        let updatedValue = [...dynamicformValues.questions];
        // correct option should be a number rather than a string
        if (event.target.name === 'correct' && event.target.value !== '') {
            updatedValue[index][event.target.name] = parseFloat(event.target.value)
        } else {
            updatedValue[index][event.target.name] = event.target.value;
        }
        setDynamicFormValues((prevValues) => {
            return {
                ...prevValues,
                questions: updatedValue
            }
        })
    }

    const [formErrors, setFormErrors] = useState({
        test_name: '',
        total_marks: '',
        test_duration: '',
        test_pin: '',
        questions: []
    });

    // Validating the input entered by user
    // All the data inside formValues will be of type string
    const validate = (formValues) => {

        let errors = {};

        if (!formValues.test_name) {
            errors.test_name = 'Required'
        } else if (formValues.test_name.length < 2) {
            errors.test_name = 'Name must have atleast 2 characters'
        } else if (formValues.test_name.length > 20) {
            errors.test_name = 'Name must not exceed 20 characters'
        }

        // Js will convert string to number when doing the comparison
        if (!formValues.total_marks) {
            errors.total_marks = 'Required'
        } else if (formValues.total_marks < 10) {
            errors.total_marks = 'Test must be of atleast 10 marks'
        } else if (formValues.total_marks > 360) {
            errors.total_marks = 'Test must not exceed 360 marks'
        } else if (!Number.isInteger(parseFloat(formValues.total_marks))) {
            errors.total_marks = 'Total marks must not include a decimal point'
        }

        if (!formValues.test_duration) {
            errors.test_duration = 'Required'
        } else if (formValues.test_duration < 1) {
            errors.test_duration = 'Test must be of atleast 1 minute'
        } else if (formValues.test_duration > 180) {
            errors.test_duration = 'Test must not exceed 180 minutes'
        } else if (!Number.isInteger(parseFloat(formValues.test_duration))) {
            errors.test_duration = 'Test duration must not include a decimal point'
        }

        if (!formValues.test_pin) {
            errors.test_pin = 'Required'
        } else if (formValues.test_pin < 100000 || formValues.test_pin > 999999) {
            errors.test_pin = 'Test pin must be of length 6'
        } else if (!Number.isInteger(parseFloat(formValues.test_pin))) {
            errors.test_pin = 'Test pin must not include a decimal point'
        }

        errors.questions = []
        let flag = 0;
        for (let i = 0; i < formValues.questions.length; i += 1) {
            errors.questions[i] = {
                title: '',
                a: '', b: '', c: '', d: '',
                correct: ''
            };
            if (!formValues.questions[i].title) {
                errors.questions[i].title = 'Required'
                flag = 1;
            }
            if (!formValues.questions[i].a) {
                errors.questions[i].a = 'Required'
                flag = 1;
            }
            if (!formValues.questions[i].b) {
                errors.questions[i].b = 'Required'
                flag = 1;
            }
            if (!formValues.questions[i].c) {
                errors.questions[i].c = 'Required'
                flag = 1;
            }
            if (!formValues.questions[i].d) {
                errors.questions[i].d = 'Required'
                flag = 1;
            }
            if (formValues.questions[i].correct === '') {
                errors.questions[i].correct = 'Required'
                flag = 1;
            } else if (formValues.questions[i].correct !== 1 && formValues.questions[i].correct !== 2 && formValues.questions[i].correct !== 3 && formValues.questions[i].correct !== 4) {
                errors.questions[i].correct = 'Enter correct option number only (1,2,3,4)'
                flag = 1;
            }
        }

        setFormErrors(errors);

        // There will always be the key "questions" in errors object. And if no error occured 
        // with questions key then flag will still be 0 which means validation is successful
        if (Object.keys(errors).length === 1 && flag === 0) return true
        return false
    }

    // Show alert message from the server
    const [showAlert, setShowAlert] = useState({
        variant: '',
        text: '',
        show: false
    });

    const [loadingSpinner, setLoadingSpinner] = useState(false)

    const formSubmitHandler = async (event) => {
        event.preventDefault();
        const formValues = { ...staticFormValues, ...dynamicformValues };
        if (validate(formValues)) {
            setLoadingSpinner(true)
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/addtest`, {
                method: 'post',
                headers: {
                    'content-type': 'application/json',
                    authorization: ctx.token
                },
                body: JSON.stringify({
                    test_name: staticFormValues.test_name,
                    total_marks: parseInt(staticFormValues.total_marks),
                    test_duration: parseInt(staticFormValues.test_duration),
                    test_pin: parseInt(staticFormValues.test_pin),
                    questions: dynamicformValues.questions
                })
            })
            const data = await response.json()
            setLoadingSpinner(false)
            let variant = 'danger'
            if (response.ok) {
                variant = 'success'
                // Reset the form
                setStaticFormValues({
                    test_name: '',
                    total_marks: '',
                    test_duration: '',
                    test_pin: ''
                })
                setDynamicFormValues({ questions: [] })
            } else {
                // Scroll to the top of the page if response is not okay
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }
            // If response is okay show success alert else show danger alert
            setShowAlert({ variant: variant, text: data.message, show: true })
        } else {
            // If form wasn't validated then scroll to the top of 
            // the page and show danger alert with error message
            window.scrollTo({ top: 0, behavior: 'smooth' })
            setShowAlert({ variant: 'danger', text: "Error in input fields", show: true })
        }
    }
    const AlertCloseHandler = () => {
        setShowAlert((prevValue) => { return { ...prevValue, show: false } })
    }
    return (
        <div>
            {loadingSpinner &&
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress style={{ 'color': 'black' }} />
                </div>
            }
            {/* show proper alert based on the response of server */}
            {showAlert.show && <Alert className={styles.card} variant={showAlert.variant} onClose={AlertCloseHandler} dismissible>
                <p>{showAlert.text}</p>
            </Alert>}
            <Form autoComplete="off" noValidate onSubmit={formSubmitHandler}>
                <div className={styles.card}>
                    <Form.Group className="mb-3" >
                        <Form.Label> Test name </Form.Label>
                        <Form.Control
                            required
                            className={formErrors.test_name ? 'is-invalid' : ''}
                            type="text"
                            value={staticFormValues.test_name}
                            onChange={staticInputChangeHandler}
                            name="test_name" />
                        {formErrors.test_name && <p className="text-danger">{formErrors.test_name}</p>}
                    </Form.Group>
                    <Form.Group className="mb-3" >
                        <Form.Label> Total marks</Form.Label>
                        <Form.Control
                            required
                            className={formErrors.total_marks ? 'is-invalid' : ''}
                            type="number"
                            value={staticFormValues.total_marks}
                            onChange={staticInputChangeHandler}
                            name="total_marks" />
                        {formErrors.total_marks && <p className="text-danger">{formErrors.total_marks}</p>}
                    </Form.Group>
                    <Form.Group className="mb-3" >
                        <Form.Label> Test duration (in minutes) </Form.Label>
                        <Form.Control
                            required
                            className={formErrors.test_duration ? 'is-invalid' : ''}
                            type="text"
                            value={staticFormValues.test_duration}
                            onChange={staticInputChangeHandler}
                            name="test_duration" />
                        {formErrors.test_duration && <p className="text-danger">{formErrors.test_duration}</p>}
                    </Form.Group>
                    <Form.Group className="mb-3" >
                        <Form.Label> Six digit test pin</Form.Label>
                        <Form.Control
                            required
                            className={formErrors.test_pin ? 'is-invalid' : ''}
                            type="number"
                            value={staticFormValues.test_pin}
                            onChange={staticInputChangeHandler}
                            name="test_pin" />
                        {formErrors.test_pin && <p className="text-danger">{formErrors.test_pin}</p>}
                    </Form.Group>
                </div>
                {dynamicformValues.questions.map((element, index) => (
                    <div className={styles.card} key={index}>
                        <h3>Question {index + 1}</h3>
                        <Form.Group className="mb-3" >
                            <Form.Label> Title </Form.Label>
                            <Form.Control
                                required
                                className={formErrors.questions.length > index ? (formErrors.questions[index].title ? 'is-invalid' : '') : ''}
                                type="text"
                                value={(dynamicformValues.questions[index].title)}
                                onChange={e => dynamicInputChangeHandler(e, index)}
                                name="title" />
                            {formErrors.questions.length > index && formErrors.questions[index].title && <p className="text-danger">{formErrors.questions[index].title}</p>}
                        </Form.Group>
                        <Form.Group className="mb-3" >
                            <Form.Label>  Option 1 </Form.Label>
                            <Form.Control
                                required
                                className={formErrors.questions.length > index ? (formErrors.questions[index].a ? 'is-invalid' : '') : ''}
                                type="text"
                                value={(dynamicformValues.questions[index].a)}
                                onChange={e => dynamicInputChangeHandler(e, index)}
                                name="a" />
                            {formErrors.questions.length > index && formErrors.questions[index].a && <p className="text-danger">{formErrors.questions[index].a}</p>}
                        </Form.Group>
                        <Form.Group className="mb-3" >
                            <Form.Label>  Option 2 </Form.Label>
                            <Form.Control
                                required
                                className={formErrors.questions.length > index ? (formErrors.questions[index].b ? 'is-invalid' : '') : ''}
                                type="text"
                                value={(dynamicformValues.questions[index].b)}
                                onChange={e => dynamicInputChangeHandler(e, index)}
                                name="b" />
                            {formErrors.questions.length > index && formErrors.questions[index].b && <p className="text-danger">{formErrors.questions[index].b}</p>}
                        </Form.Group>
                        <Form.Group className="mb-3" >
                            <Form.Label>  Option 3 </Form.Label>
                            <Form.Control
                                required
                                className={formErrors.questions.length > index ? (formErrors.questions[index].c ? 'is-invalid' : '') : ''}
                                type="text"
                                value={(dynamicformValues.questions[index].c)}
                                onChange={e => dynamicInputChangeHandler(e, index)}
                                name="c" />
                            {formErrors.questions.length > index && formErrors.questions[index].c && <p className="text-danger">{formErrors.questions[index].c}</p>}
                        </Form.Group>
                        <Form.Group className="mb-3" >
                            <Form.Label>  Option 4 </Form.Label>
                            <Form.Control
                                required
                                className={formErrors.questions.length > index ? (formErrors.questions[index].d ? 'is-invalid' : '') : ''}
                                type="text"
                                value={(dynamicformValues.questions[index].d)}
                                onChange={e => dynamicInputChangeHandler(e, index)}
                                name="d" />
                            {formErrors.questions.length > index && formErrors.questions[index].d && <p className="text-danger">{formErrors.questions[index].d}</p>}
                        </Form.Group>
                        <Form.Group className="mb-3" >
                            <Form.Label> Correct Option Number </Form.Label>
                            <Form.Control
                                required
                                className={formErrors.questions.length > index ? (formErrors.questions[index].correct ? 'is-invalid' : '') : ''}
                                type="number"
                                value={(dynamicformValues.questions[index].correct)}
                                placeholder="Mention the correct option number (1,2,3,4)"
                                onChange={e => dynamicInputChangeHandler(e, index)}
                                name="correct" />
                            {formErrors.questions.length > index && formErrors.questions[index].correct && <p className="text-danger">{formErrors.questions[index].correct}</p>}
                        </Form.Group>
                    </div>
                ))}
                <div className={styles.buttoncard}>
                    <Button variant="outline-primary" onClick={addQuestion}> Add a question </Button>
                    <Button variant="outline-primary" disabled={dynamicformValues.questions.length === 0} className={styles.submit_button} type="submit"> Submit </Button>
                </div>
            </Form>
        </div>
    )
}

export default AddTest