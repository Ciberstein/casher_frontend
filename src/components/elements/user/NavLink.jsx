import { Link } from 'react-router-dom';

export const NavLink = ({
  children,
  className = '',
  as: As = Link,
  ...props
}) => {
  return (
    <As
      className={`px-3 py-2 rounded-lg font-medium text-muted cursor-pointer
        hover:text-ink hover:bg-sunken transition-colors duration-150 ${className}`}
      {...props}
    >
      {children}
    </As>
  );
};
