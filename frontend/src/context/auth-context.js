import { createContext } from 'react';

const AuthContext = createContext({
    token: null,
    setToken: () => { },
    name: '',
    setName: () => { },
    userId: '',
    setUserId: () => { }
})

export default AuthContext;