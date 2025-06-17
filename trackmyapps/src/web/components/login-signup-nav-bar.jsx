import { useNavigate } from 'react-router-dom';


export const LoginAndSignupNavBar = () => {
    const navigate = useNavigate();
    
    return (
        <>
            <nav className="fixed top-0 w-full z-50 bg-sky-700 px-4 py-5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <h1 onClick={() => navigate('/')} className="cursor-pointer text-white font-bold text-xl hover:opacity-90">TrackMyApps</h1>
                </div>
            </nav>
        </>
    )
};  