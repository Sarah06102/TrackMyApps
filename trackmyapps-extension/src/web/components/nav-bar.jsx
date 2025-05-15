import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
    return (
        <div>
            <Link to='/'>Home</Link>
            <Link to='/login'>Login</Link>
            <Link to='/signup'>Sign Up</Link>
            <Link to='/dashboard'>Dashboard</Link>
        </div>
    );
}

export default NavBar;