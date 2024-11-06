import ConfigDetails from '../components/user/config-section/ConfigDetails';
import Configs from '../components/user/config-section/Configs';
import Home from '../components/user/home-section/Home';
import Plans from '../components/user/plan-section/Plans';
import Profile from '../components/user/profile-section/Profile';
import { Route } from 'react-router-dom';

const UserRoutes = () => {
  document.body.style.backgroundColor = '#f9f9f9'

    return (
        <>
            <Route path='/home' element={<Home/>} />
            <Route path='/profile' element={<Profile/>} />
            <Route path='/plans' element={<Plans/>} />
            <Route path='/configs' element={<Configs/>} />
            <Route path='/configs/:configID' element={<ConfigDetails/>} />
        </>
    );
};

export default UserRoutes;