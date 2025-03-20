import { Ring } from '@uiball/loaders';
import React from 'react';
import { useSelector } from 'react-redux';

export const Loader = () => {
  const loader = useSelector((state) => state.loader);
  return (
    <div
      className={`${
        loader && 'hidden'
      } absolute z-50 bg-black/50 w-full h-full`}
    >
      <div className="flex flex-colum flex-grow h-full justify-center items-center backdrop-blur-lg">
        <Ring
          size={40}
          lineWeight={5}
          speed={2}
          color="white"
        />
      </div>
    </div>
  );
};