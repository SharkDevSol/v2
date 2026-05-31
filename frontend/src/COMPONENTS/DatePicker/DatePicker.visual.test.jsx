import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import DatePicker from './DatePicker';

/**
 * Visual regression tests for DatePicker component
 * These tests verify that the component renders without errors
 */

describe('DatePicker Visual Tests', () => {
  it('should render without crashing', () => {
    const { container } = render(
      <DatePicker
        label="Test Date"
        value={null}
        onChange={() => {}}
      />
    );
    expect(container).toBeTruthy();
  });

  it('should render with all props', () => {
    const { container } = render(
      <DatePicker
        label="Test Date"
        value={new Date(2024, 0, 15)}
        onChange={() => {}}
        minDate={new Date(2024, 0, 1)}
        maxDate={new Date(2024, 11, 31)}
        placeholder="Select date"
        error="Test error"
        required
        disabled={false}
        calendarType="gregorian"
      />
    );
    expect(container).toBeTruthy();
  });

  it('should render Ethiopian calendar without crashing', () => {
    const { container } = render(
      <DatePicker
        label="Ethiopian Date"
        value={new Date(2024, 0, 15)}
        onChange={() => {}}
        calendarType="ethiopian"
      />
    );
    expect(container).toBeTruthy();
  });

  it('should render in disabled state', () => {
    const { container } = render(
      <DatePicker
        label="Disabled Date"
        value={new Date(2024, 0, 15)}
        onChange={() => {}}
        disabled
      />
    );
    expect(container).toBeTruthy();
  });

  it('should render with error state', () => {
    const { container } = render(
      <DatePicker
        label="Error Date"
        value={null}
        onChange={() => {}}
        error="This field is required"
        required
      />
    );
    expect(container).toBeTruthy();
  });
});
