import React, { useState } from 'react';
import DatePicker from './DatePicker';

/**
 * DatePicker Component Examples
 * 
 * This file demonstrates various use cases of the DatePicker component
 */

export const BasicDatePicker = () => {
  const [date, setDate] = useState(null);

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h3>Basic DatePicker</h3>
      <DatePicker
        label="Select Date"
        value={date}
        onChange={setDate}
        placeholder="Choose a date"
      />
      <p>Selected: {date ? date.toDateString() : 'None'}</p>
    </div>
  );
};

export const DatePickerWithValidation = () => {
  const [date, setDate] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (newDate) => {
    setDate(newDate);
    if (!newDate) {
      setError('Date is required');
    } else {
      setError('');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h3>DatePicker with Validation</h3>
      <DatePicker
        label="Birth Date"
        value={date}
        onChange={handleChange}
        error={error}
        required
        placeholder="Select your birth date"
      />
    </div>
  );
};

export const DatePickerWithMinMax = () => {
  const [date, setDate] = useState(null);
  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h3>DatePicker with Min/Max Dates</h3>
      <p>Only dates in current month are selectable</p>
      <DatePicker
        label="Appointment Date"
        value={date}
        onChange={setDate}
        minDate={minDate}
        maxDate={maxDate}
        placeholder="Select appointment date"
      />
      <p>Selected: {date ? date.toDateString() : 'None'}</p>
    </div>
  );
};

export const EthiopianDatePicker = () => {
  const [date, setDate] = useState(null);

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h3>Ethiopian Calendar DatePicker</h3>
      <DatePicker
        label="የቀን መምረጫ (Date Selector)"
        value={date}
        onChange={setDate}
        calendarType="ethiopian"
        placeholder="ቀን ይምረጡ (Select date)"
      />
      <p>Selected: {date ? date.toDateString() : 'None'}</p>
    </div>
  );
};

export const DisabledDatePicker = () => {
  const [date] = useState(new Date());

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h3>Disabled DatePicker</h3>
      <DatePicker
        label="Registration Date"
        value={date}
        onChange={() => {}}
        disabled
        placeholder="Cannot change"
      />
    </div>
  );
};

export const MultipleDatePickers = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h3>Date Range Selection</h3>
      <DatePicker
        label="Start Date"
        value={startDate}
        onChange={setStartDate}
        maxDate={endDate}
        placeholder="Select start date"
      />
      <div style={{ marginTop: '16px' }}>
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={setEndDate}
          minDate={startDate}
          placeholder="Select end date"
        />
      </div>
      {startDate && endDate && (
        <p style={{ marginTop: '16px' }}>
          Range: {startDate.toDateString()} - {endDate.toDateString()}
        </p>
      )}
    </div>
  );
};

// Demo component showing all examples
const DatePickerExamples = () => {
  return (
    <div style={{ padding: '40px' }}>
      <h1>DatePicker Component Examples</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px' }}>
        <BasicDatePicker />
        <DatePickerWithValidation />
        <DatePickerWithMinMax />
        <EthiopianDatePicker />
        <DisabledDatePicker />
        <MultipleDatePickers />
      </div>
    </div>
  );
};

export default DatePickerExamples;
