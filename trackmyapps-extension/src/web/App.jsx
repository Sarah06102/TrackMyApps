import Login from './pages/auth/login.jsx';
import NavBar from "./components/nav-bar.jsx";
import SignUp from './pages/auth/signup.jsx';
import authDetails from './pages/auth-details.jsx';
import Dashboard from './pages/dashboard.jsx';
import './index.css'

function App() {
  return (
    <>
    
      <NavBar />
      <Login />
      <SignUp />
      <authDetails />
      <Dashboard />
      
    </>
  )
}

export default App
