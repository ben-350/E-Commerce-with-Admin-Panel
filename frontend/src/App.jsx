import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/Loginpage";
import Homepage from "./pages/Homepage";
import Navbar from "./components/Navbar";
import { Routes, Route } from 'react-router-dom';
import { useUserStore } from "./stores/useuserStore";
import { useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import { Navigate } from "react-router-dom";

function App() {
  const {user,checkAuth, checkingAuth}=useUserStore();
  useEffect(()=>{
    checkAuth();

  },[checkAuth]);
  if(checkingAuth) return <LoadingSpinner/>
  return (
    <div>
      <div className='min-h-screen bg-gray-900 text-white relative overflow-hidden'>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0">
            <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(10,80,60,0.2)_45%,rgba(0,0,0,0.1)_100%)]'/>
          </div>
      <div className='relative z-50 pt-20'/>
      </div>
      <Navbar />
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/signup' element={!user? <SignupPage />:<Navigate to='/'/>} />
        <Route path='/login' element={!user? <LoginPage/> :<Navigate to='/' />} />
      </Routes>
      Hello world
    </div>
    </div>
  );
}

export default App;
