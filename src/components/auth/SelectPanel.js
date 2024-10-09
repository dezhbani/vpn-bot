import { Link } from "react-router-dom";
import Modal from "../public/components/Modal";
import UserIcon from './assets/User.svg';
import AdminIcon from './assets/Admin.svg';

const SelectPanel = () => {
    return (
      <Modal isOpen={true}>
        <div className='dir-ltr flex flex-col m-5'>
          <Link to='/home'>
            <div className='flex bg-white shadow-md pr-4 pl-8 py-3 my-3 mx-3 rounded-lg border-2 border-transparent hover:border-main-blue transition-all duration-300'>
              <p className='text-2xl font-[iran-sans] px-8'>پنل کاربری</p>
              <img className='h-8' src={UserIcon} alt="User Icon" />
            </div>
          </Link>
          <Link to='/dashboard'>
            <div className='flex bg-white shadow-md pr-4 pl-8 py-3 my-3 mx-3 rounded-lg border-2 border-transparent hover:border-main-blue transition-all duration-300'>
              <p className='text-2xl font-[iran-sans] px-8'>پنل فروش</p>
              <img className='h-8' src={AdminIcon} alt="Admin Icon" />
            </div>
          </Link>
        </div>
      </Modal>
    );
  };
  export default SelectPanel