import { useAuthStore } from '@/features/Auth/AuthStore';
import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router';


const AuthLayout = () => {

    const router = useNavigate();;
    const token = useAuthStore.getState().token;
    
   useEffect(() => {
    if(token) {
        router('/');
    }
   }, []);

   if(token) {
    return}
    
  return (
    <div>
        <Outlet></Outlet>
    </div>
  )
}

export default AuthLayout