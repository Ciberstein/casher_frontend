import React from 'react';

export const Button = ({
  as: As = 'button',
  children = '',
  variant = 'normal',
  color = 'blue',
  className = '',
  size = 'md',
  ...props
}) => {
  const variants = {

    sm: {
      outline: {
        red: "py-1 !border-red-500 text-red-500 text-sm",
        gray: "py-1 !border-gray-500 text-gray-500 text-sm",
        blue: "py-1 !border-blue-600 text-blue-600 text-sm",
        green: "py-1 !border-green-700 text-green-700 text-sm",
        yellow: "py-1 !border-yellow-500 text-black text-sm",
      },
      normal: {
        red: "py-1 bg-red-600 text-white text-sm",
        gray: "py-1 bg-gray-600 text-white text-sm",
        blue: "py-1 bg-blue-600 text-white text-sm",
        green: "py-1 bg-green-700 text-white text-sm",
        yellow: "py-1 bg-yellow-500 text-black text-sm",
      }
    },

    md: {
      outline: {
        red: "bg-red-500 text-red-500",
        gray: "py-2 !border-gray-500 text-gray-500",
        blue: "py-2 !border-blue-600 text-blue-600",
        green: "py-2 !border-green-700 text-green-700",
        yellow: "py-2 !border-yellow-500 text-black",
      },
      normal: {
        red: "py-2 bg-red-600 text-white",
        gray: "py-2 bg-gray-600 text-white",
        blue: "py-2 bg-blue-600 text-white",
        green: "py-2 bg-green-700 text-white",
        yellow: "py-2 bg-yellow-500 text-black",
      }
    },

    lg: {
      outline: {
        red: "py-2 !border-red-500 text-red-500 text-xl",
        gray: "py-2 !border-gray-500 text-gray-500 text-xl",
        blue: "py-2 !border-blue-600 text-blue-600 text-xl",
        green: "py-2 !border-green-700 text-green-700 text-xl",
        yellow: "py-2 !border-yellow-500 text-black text-xl",
      },
      normal: {
        red: "py-2 bg-red-600 text-white text-xl",
        gray: "py-2 bg-gray-600 text-white text-xl",
        blue: "py-2 bg-blue-600 text-white text-xl",
        green: "py-2 bg-green-700 text-white text-xl",
        yellow: "py-2 bg-yellow-500 text-black text-xl",
      }
    },

    xl: {
      outline: {
        red: "!border-red-600 text-red-600 text-2xl",
        gray: "py-3 !border-gray-500 text-gray-500 text-2xl",
        blue: "py-3 !border-blue-600 text-blue-600 text-2xl",
        green: "py-3 !border-green-700 text-green-700 text-2xl",
        yellow: "py-3 !border-yellow-500 text-black text-2xl",
      },
      normal: {
        red: "py-3 bg-red-500 text-white text-2xl",
        gray: "py-3 bg-gray-600 text-white text-2xl",
        blue: "py-3 bg-blue-600 text-white text-2xl",
        green: "py-3 bg-green-700 text-white text-2xl",
        yellow: "py-3 bg-yellow-500 text-black text-2xl",
      }
    },
  };

  return (
    <As
      className={`rounded-xl px-6 text-center hover:brightness-75 disabled:brightness-75 border border-transparent
        ${variants[size][variant][color]}
        ${className}`}
      {...props}
    >
      {children}
    </As>
  );
};
