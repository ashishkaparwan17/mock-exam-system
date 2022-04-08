import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import NotFound from './components/NotFound';
import AuthContext from './context/auth-context';
import AddTest from './components/AddTest';
import Test from './components/Test';

const App = () => {

  const [token, setToken] = useState(null)
  const [name, setName] = useState('')
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const data = localStorage.getItem('userData')
    // if data exists in the local storage then parse it
    // JSON.parse takes json string and converts it into object
    if (data) {
      const storedData = JSON.parse(data)
      setToken(storedData.token)
      setName(storedData.name)
      setUserId(storedData.userId)
    }
  }, []);

  let routes;
  // Unauthenticated user
  if (!token) {
    routes = (
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        {/* if a user is not logged in and still tries to 
        access addtest and test route then redirect them to login page */}
        <Route path='/addtest' element={<Navigate to='/login' />} />
        <Route path='/test' element={<Navigate to='/login' />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    )
  } 
  // Authenticated user
  else {
    routes = (
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/addtest' element={<AddTest />} />
        <Route path='/test' element={<Test />} />
        {/* if a logged in user tries to access login and
        signup routes then redirect them to home page */}
        <Route path='/login' element={<Navigate to='/' />} />
        <Route path='/signup' element={<Navigate to='/' />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    )
  }

  return (
    <AuthContext.Provider value={{
      token, setToken, name, setName, userId, setUserId
    }}>
      <BrowserRouter>
        <NavBar />
        {routes}
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

export default App