import Image from 'next/image';
import React from 'react';
import ImgNodata from '@/public/images/no-data.gif';

const CustomNoRowsOverlay = () => {
	return (
		<div className='w-full h-full items-center justify-center flex'>
			<div>
				<Image src={ImgNodata} alt='No data' width={150} height={150} />
				<p className='text-sm text-gray-500 text-center'>No data available</p>
			</div>
		</div>
	);
};

export default CustomNoRowsOverlay;
