import Home from '../components/user/home-section/Home';
import Profile from '../components/user/profile-section/Profile';
import { Route } from 'react-router-dom';

const UserRoutes = () => {
  document.body.style.backgroundColor = '#f9f9f9'

    return (
        <>
            <Route path='/home' element={<Home/>} />
            <Route path='/profile' element={<Profile/>} />
        </>
    );
};

export default UserRoutes;