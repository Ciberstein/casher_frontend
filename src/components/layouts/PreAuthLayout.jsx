import { Navbar } from '../shared/user/Navbar'
import { Footer } from '../shared/user/Footer'
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

export const PreAuthLayout = ({ children }) => {

  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth) navigate('/');
  }, [auth]);

  return (
    <div className="bg-bottom bg-cover bg-no-repeat dark:bg-zinc-800">
      <div className="w-full lg:w-3/4 xl:w-4/5 h-screen flex flex-col gap-6 justify-center mx-auto">
        <Navbar />
        <div className="col-span-3 h-full overflow-y-auto dark:text-white px-6 lg:p-0">
          {children}
        </div>
        <Footer />
      </div>
    </div>
  )
}
