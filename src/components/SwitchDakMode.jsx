import { useDispatch, useSelector } from "react-redux";
import { setDarkMode } from "../store/slices/darkMode.slice";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline"

export const SwitchDakMode = () => {

	const darkMode = useSelector((state) => state.darkMode);
	const dispatch = useDispatch();
  
	const handleDarkMode = (status) => {
	  dispatch(setDarkMode(status));
	  localStorage.setItem('darkMode', status);
	};

  return (
    <button
			className="w-16 h-8 rounded-full relative overflow-hidden grid grid-cols-2 p-1.5 gap-1 dark:bg-zinc-700/80"
			style={{ boxShadow: 'inset 0px 0px 8px #80808096' }}
			onClick={() => handleDarkMode(!darkMode)}
		>
			<div className={`h-full aspect-square z-10 absolute transition-all top-0 p-0.5
				${ darkMode && 'translate-x-full' }`} >
				<div 
					className={`${ darkMode ? 'bg-gray-400' : 'bg-yellow-300' } rounded-full p-1`}
					style={{ boxShadow: 'inset 0px 0px 8px #00000080' }}	
				>
					{ darkMode ? <MoonIcon /> : <SunIcon /> }
				</div>
			</div>
			<SunIcon className="h-full"/>
			<MoonIcon className="h-full"/>
		</button>
  )
}
