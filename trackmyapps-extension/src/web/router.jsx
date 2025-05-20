import React from 'react'
import { createBrowserRouter } from "react-router-dom";
import App from './App.jsx'
import Login from './pages/auth/login.jsx'
import Home from './pages/home.jsx';
import SignUp from './pages/auth/signup.jsx'
import Dashboard from './pages/dashboard.jsx';

export const router = createBrowserRouter([
    { path: "/", element: <Home />}, 
    { path: "/login", element: <Login />},
    { path: "/signup", element: <SignUp />},
    { path: "/dashboard", element: <Dashboard />},
  ]);