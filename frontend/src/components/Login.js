import React, { useContext, useState } from 'react'
import { Form, Button, Alert } from 'react-bootstrap'
import styles from './Login.module.css'
import { Formik } from 'formik'
import * as yup from 'yup'
import AuthContext from '../context/auth-context'
import Swal from 'sweetalert2'
import CircularProgress from '@mui/material/CircularProgress';

// login validation schema along with their error messages
// input will be validated for every key stroke
const validationSchema = yup.object({
    email: yup.string()
        .matches(/.+@.+\...+/, 'Invalid email')
        .email('Invalid email')
        .required('Required'),
    password: yup.string()
        .min(5, 'Password should be 5 characters minimum')
        .required('Required'),
})

const Login = () => {
    const ctx = useContext(AuthContext);

    // Show alert message from the server
    const [showAlert, setShowAlert] = useState({
        text: '',
        show: false
    });
    // initial values that we will pass to Formik
    const initialValues = {
        email: '',
        password: '',
    }

    const [loadingSpinner, setLoadingSpinner] = useState(false)

    // "values" contain input entered by the user
    // this function will run only after successful validation
    const formSubmitHandler = async (values, { resetForm }) => {
        setLoadingSpinner(true)
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/login`, {
            method: 'post',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                email: values.email,
                password: values.password,
            })
        })
        const data = await response.json();
        setLoadingSpinner(false)
        // if response is not okay then show danger alert
        if (!response.ok) {
            setShowAlert({ text: data.message, show: true });
        } else {
            setShowAlert({ text: '', show: false });
            resetForm();
            ctx.setToken(data.token)
            ctx.setName(data.name)
            ctx.setUserId(data.id)
            localStorage.setItem('userData', JSON.stringify({
                token: data.token,
                name: data.name,
                userId: data.id
            }));
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: false,
            })
            Toast.fire({
                icon: 'success',
                title: 'Signed in successfully'
            })
        }
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
            {/* show danger alert based on the response of server */}
            {showAlert.show && <Alert className={styles.card} variant="danger" onClose={AlertCloseHandler} dismissible>
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
                                    <Form.Label> Email address </Form.Label>
                                    <Form.Control
                                        required
                                        // when input had errors and it was touched then it is invalid
                                        isInvalid={!!formik.errors.email && formik.touched.email}
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.email}
                                        type="email"
                                        // onBlur and onChange need name attribute to figure out which field to update
                                        name="email" />
                                    {/* This will run only if input is invalid */}
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
                                <Button variant="outline-primary" type="submit"> Log in </Button>
                            </Form>
                        </div>
                    )
                }
            </Formik>
        </>
    );
}

export default Login