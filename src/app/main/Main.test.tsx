import React from 'react';
import { render, screen } from '@testing-library/react';

import { Main } from './Main';

describe('Main', () => {
  test('renders', () => {
    render(<Main />);
    const element = screen.getByText('Main');
    expect(element).toBeInTheDocument();
  });
});
