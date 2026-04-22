import { Box, CircularProgress } from '@mui/material';
import React from 'react';

const CustomLoadingOverlay = () => {
	return (
		<div>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					height: '100%',
				}}
			>
				<CircularProgress />
				<p style={{ marginTop: 10, fontSize: '0.875rem', color: '#666' }}>
					Loading Members...
				</p>
			</Box>
		</div>
	);
};

export default CustomLoadingOverlay;
