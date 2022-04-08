import React, { useContext } from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import styles from './NavBar.module.css'
import { Link, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2'
import AuthContext from '../context/auth-context';

const HomeNav = () => {

    const ctx = useContext(AuthContext);

    const logoutHandler = () => {
        Swal.fire({
            title: 'Are you sure you want to logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#c8303f',
            cancelButtonColor: '#0c6efd',
            confirmButtonText: 'Yes, Logout!'
        }).then((result) => {
            if (result.isConfirmed) {
                ctx.setToken(null);
                ctx.setName('');
                localStorage.removeItem('userData')
                window.location.reload();
            }
        })
    }

    // The useLocation() hook returns an object that
    // contains the pathname key. We are using
    // this pathname key to get the actual path.
    const current_path = useLocation().pathname;

    return (
        <Navbar className={styles.navbar} variant="dark">
            <Container>
                <Navbar.Brand as={Link} className={`${current_path === "/" ? `${styles.active}` : ''}`} to="/">
                    Home
                </Navbar.Brand>
                {!ctx.token && <Nav>
                    <Navbar.Brand as={Link} className={`${current_path === "/login" ? `${styles.active}` : ''}`} to='/login'>
                        Login
                    </Navbar.Brand>
                    <Navbar.Brand as={Link} className={`${current_path === "/signup" ? `${styles.active}` : ''}`} to='/signup'>
                        Signup
                    </Navbar.Brand>
                </Nav>}
                {ctx.token && <Nav>
                    <Navbar.Brand as={Link} className={`${current_path === "/addtest" ? `${styles.active}` : ''}`} to='/addtest'>
                        Add test
                    </Navbar.Brand>
                    <Navbar.Brand as={Link} to='/' onClick={logoutHandler}>
                        Logout
                    </Navbar.Brand>
                </Nav>}
            </Container>
        </Navbar>
    )
}

export default HomeNav