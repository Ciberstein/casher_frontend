import { Link } from 'react-router-dom';

export const NavLink = ({
  children,
  className = '',
  as: As = Link,
  ...props
}) => {
  return (
    <As
      className={`p-2 text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-900/50 rounded-xl
        transition-all ease-in duration-100 font-medium cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </As>
  );
};
