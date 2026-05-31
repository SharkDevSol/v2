import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FormGroup from './FormGroup';

describe('FormGroup Component', () => {
  it('renders with label and children', () => {
    render(
      <FormGroup label="Test Label">
        <input type="text" placeholder="Test input" />
      </FormGroup>
    );
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument();
  });

  it('displays required asterisk when required prop is true', () => {
    render(
      <FormGroup label="Required Field" required>
        <input type="text" />
      </FormGroup>
    );
    
    const asterisk = screen.getByLabelText('required');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveTextContent('*');
  });

  it('displays error message when error prop is provided', () => {
    render(
      <FormGroup label="Field" error="This field is required">
        <input type="text" />
      </FormGroup>
    );
    
    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent('This field is required');
  });

  it('displays helper text when helperText prop is provided', () => {
    render(
      <FormGroup label="Field" helperText="Enter your name">
        <input type="text" />
      </FormGroup>
    );
    
    expect(screen.getByText('Enter your name')).toBeInTheDocument();
  });

  it('does not display helper text when error is present', () => {
    render(
      <FormGroup 
        label="Field" 
        error="Error message" 
        helperText="Helper text"
      >
        <input type="text" />
      </FormGroup>
    );
    
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
  });

  it('adds aria-describedby to children', () => {
    render(
      <FormGroup label="Field" helperText="Helper text">
        <input type="text" data-testid="test-input" />
      </FormGroup>
    );
    
    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('aria-describedby');
  });

  it('sets aria-invalid on children when error is present', () => {
    render(
      <FormGroup label="Field" error="Error message">
        <input type="text" data-testid="test-input" />
      </FormGroup>
    );
    
    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-required on children when required is true', () => {
    render(
      <FormGroup label="Field" required>
        <input type="text" data-testid="test-input" />
      </FormGroup>
    );
    
    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  it('renders without label', () => {
    render(
      <FormGroup helperText="Helper text">
        <input type="text" placeholder="No label" />
      </FormGroup>
    );
    
    expect(screen.getByPlaceholderText('No label')).toBeInTheDocument();
    expect(screen.getByText('Helper text')).toBeInTheDocument();
  });

  it('applies inline class when inline prop is true', () => {
    const { container } = render(
      <FormGroup label="Field" inline>
        <input type="text" />
      </FormGroup>
    );
    
    const formGroup = container.firstChild;
    // CSS modules transform class names, so we check if it contains the inline class
    expect(formGroup.className).toContain('inline');
  });

  it('applies custom className', () => {
    const { container } = render(
      <FormGroup label="Field" className="custom-class">
        <input type="text" />
      </FormGroup>
    );
    
    const formGroup = container.firstChild;
    expect(formGroup).toHaveClass('custom-class');
  });

  it('renders label icon when provided', () => {
    const Icon = () => <span data-testid="icon">📝</span>;
    
    render(
      <FormGroup label="Field" labelIcon={<Icon />}>
        <input type="text" />
      </FormGroup>
    );
    
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('associates label with input using htmlFor', () => {
    render(
      <FormGroup label="Field" htmlFor="test-input">
        <input type="text" id="test-input" />
      </FormGroup>
    );
    
    const label = screen.getByText('Field').closest('label');
    expect(label).toHaveAttribute('for', 'test-input');
  });
});
