import React, { useState } from 'react'
import { Form, Button, Alert } from 'react-bootstrap'
import styles from './Signup.module.css'
import { Formik } from 'formik'
import * as yup from 'yup'
import CircularProgress from '@mui/material/CircularProgress';

// signup validation schema along with their error messages
// input will be validated for every key stroke
const validationSchema = yup.object({
    name: yup.string()
        .min(2, 'Name must have atleast 2 characters')
        .max(30, 'Name must not exceed 30 characters')
        .required('Required'),
    email: yup.string()
        .matches(/.+@.+\...+/, 'Invalid email')
        .email('Invalid email')
        .required('Required'),
    password: yup.string()
        .min(5, 'Password should be 5 characters minimum')
        .required('Required'),
    cpassword: yup.string()
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Required')
})

const Signup = () => {
    // Show alert message from the server
    const [showAlert, setShowAlert] = useState({
        variant: '',
        text: '',
        show: false
    });
    // initial values that we will pass to Formik
    const initialValues = {
        name: '',
        email: '',
        password: '',
        cpassword: ''
    }

    const [loadingSpinner, setLoadingSpinner] = useState(false)

    // "values" contain input entered by the user
    // this function will run only after successful validation
    const formSubmitHandler = async (values, { resetForm }) => {
        setLoadingSpinner(true)        
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/signup`, {
            method: 'post',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                name: values.name,
                email: values.email,
                password: values.password,
                cpassword: values.cpassword
            })
        })
        const data = await response.json();
        setLoadingSpinner(false)
        let variant = 'danger';
        if (response.ok) {
            variant = 'success'
            resetForm();
        }
        // if response is okay show success alert else show danger alert
        setShowAlert({ variant: variant, text: data.message, show: true })
    }
    const AlertCloseHandler = () => {
        setShowAlert((prevValue) => { return { ...prevValue, show: false } })
    }
    return (
        <>
            {loadingSpinner &&
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress style={{ 'color': 'black' }} />
                </div>
            }
            {/* show proper alert based on the response of server */}
            {showAlert.show && <Alert className={styles.card} variant={showAlert.variant} onClose={AlertCloseHandler} dismissible>
                <p>{showAlert.text}</p>
            </Alert>}
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={formSubmitHandler}
            >{
                    // Formik will provide us with a prop that we can use to access various functions
                    // that prop has been named 'formik'
                    (formik) => (
                        <div className={styles.card}>
                            {/* Avoid browser validation by adding novalidate */}
                            {/* formik.handleSubmit will pass values of the form to onSubmit of <Formik> */}
                            <Form autoComplete="off" noValidate onSubmit={formik.handleSubmit}>
                                <Form.Group className="mb-3" >
                                    <Form.Label> Name </Form.Label>
                                    <Form.Control
                                        required
                                        // when input had errors and it was touched then it is invalid
                                        isInvalid={!!formik.errors.name && formik.touched.name}
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.name}
                                        type="text"
                                        // onBlur and onChange need name attribute to figure out which field to update
                                        name="name" />
                                    {/* This will run only if input is invalid */}
                                    <Form.Control.Feedback type="invalid"> {formik.errors.name} </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group className="mb-3" >
                                    <Form.Label> Email address </Form.Label>
                                    <Form.Control
                                        required
                                        isInvalid={!!formik.errors.email && formik.touched.email}
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.email}
                                        type="email"
                                        name="email" />
                                    <Form.Control.Feedback type="invalid"> {formik.errors.email} </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group className="mb-3" >
                                    <Form.Label> Password </Form.Label>
                                    <Form.Control
                                        required
                                        isInvalid={!!formik.errors.password && formik.touched.password}
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.password}
                                        type="password"
                                        name="password" />
                                    <Form.Control.Feedback type="invalid"> {formik.errors.password} </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group className="mb-3" >
                                    <Form.Label> Confirm Password </Form.Label>
                                    <Form.Control
                                        required
                                        isInvalid={!!formik.errors.cpassword && formik.touched.cpassword}
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.cpassword}
                                        type="password"
                                        name="cpassword" />
                                    <Form.Control.Feedback type="invalid"> {formik.errors.cpassword} </Form.Control.Feedback>
                                </Form.Group>
                                <Button variant="outline-primary" type="submit"> Sign up </Button>
                            </Form>
                        </div>
                    )
                }
            </Formik>
        </>
    );
}

export default Signup