import React from 'react';
import { ThemeProvider } from '@mui/material';

import { theme } from './theme/theme';
import { Main } from './app/main/Main';

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Main />
    </ThemeProvider>
  );
};
