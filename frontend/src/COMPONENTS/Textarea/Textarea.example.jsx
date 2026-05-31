/**
 * Textarea Component Usage Examples
 * 
 * This file demonstrates various use cases of the Textarea component.
 * These examples can be used as a reference for implementing the component
 * throughout the application.
 */

import React, { useState } from 'react';
import Textarea from './Textarea';

/**
 * Example 1: Basic Textarea
 * Simple textarea with label and placeholder
 */
export const BasicTextarea = () => {
  const [value, setValue] = useState('');
  
  return (
    <Textarea
      label="Description"
      placeholder="Enter your description..."
      value={value}
      onChange={setValue}
    />
  );
};

/**
 * Example 2: Required Textarea with Helper Text
 * Textarea with required indicator and helper text
 */
export const RequiredTextarea = () => {
  const [value, setValue] = useState('');
  
  return (
    <Textarea
      label="Comments"
      placeholder="Enter your comments..."
      value={value}
      onChange={setValue}
      required
      helperText="Please provide detailed comments"
    />
  );
};

/**
 * Example 3: Textarea with Character Counter
 * Shows character count without limit
 */
export const TextareaWithCounter = () => {
  const [value, setValue] = useState('');
  
  return (
    <Textarea
      label="Bio"
      placeholder="Tell us about yourself..."
      value={value}
      onChange={setValue}
      showCount
      rows={6}
    />
  );
};

/**
 * Example 4: Textarea with Max Length
 * Enforces maximum character limit with counter
 */
export const TextareaWithMaxLength = () => {
  const [value, setValue] = useState('');
  
  return (
    <Textarea
      label="Short Description"
      placeholder="Enter a brief description..."
      value={value}
      onChange={setValue}
      maxLength={200}
      helperText="Keep it brief and concise"
    />
  );
};

/**
 * Example 5: Auto-Resize Textarea
 * Automatically grows with content
 */
export const AutoResizeTextarea = () => {
  const [value, setValue] = useState('');
  
  return (
    <Textarea
      label="Notes"
      placeholder="Add your notes..."
      value={value}
      onChange={setValue}
      autoResize
      rows={3}
    />
  );
};

/**
 * Example 6: Textarea with Error State
 * Shows validation error message
 */
export const TextareaWithError = () => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  
  const handleChange = (newValue) => {
    setValue(newValue);
    if (newValue.length < 10) {
      setError('Description must be at least 10 characters');
    } else {
      setError('');
    }
  };
  
  return (
    <Textarea
      label="Product Description"
      placeholder="Describe the product..."
      value={value}
      onChange={handleChange}
      error={error}
      required
    />
  );
};

/**
 * Example 7: Textarea with Success State
 * Shows validation success message
 */
export const TextareaWithSuccess = () => {
  const [value, setValue] = useState('This is a valid description with enough content.');
  
  return (
    <Textarea
      label="Review"
      placeholder="Write your review..."
      value={value}
      onChange={setValue}
      success="Great! Your review looks good."
    />
  );
};

/**
 * Example 8: Textarea with Warning State
 * Shows validation warning message
 */
export const TextareaWithWarning = () => {
  const [value, setValue] = useState('Short text');
  
  return (
    <Textarea
      label="Feedback"
      placeholder="Provide your feedback..."
      value={value}
      onChange={setValue}
      warning="Consider adding more details to your feedback"
    />
  );
};

/**
 * Example 9: Disabled Textarea
 * Non-interactive textarea
 */
export const DisabledTextarea = () => {
  return (
    <Textarea
      label="System Message"
      value="This field is disabled and cannot be edited."
      onChange={() => {}}
      disabled
    />
  );
};

/**
 * Example 10: Read-Only Textarea
 * Display-only textarea
 */
export const ReadOnlyTextarea = () => {
  return (
    <Textarea
      label="Terms and Conditions"
      value="By using this service, you agree to our terms and conditions. This text is read-only and cannot be modified."
      onChange={() => {}}
      readOnly
      rows={4}
    />
  );
};

/**
 * Example 11: Textarea with Custom Resize
 * Control resize behavior
 */
export const CustomResizeTextarea = () => {
  const [value, setValue] = useState('');
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Textarea
        label="Vertical Resize Only (Default)"
        placeholder="Can resize vertically..."
        value={value}
        onChange={setValue}
        resize="vertical"
      />
      
      <Textarea
        label="No Resize"
        placeholder="Cannot resize..."
        value={value}
        onChange={setValue}
        resize="none"
      />
      
      <Textarea
        label="Both Directions"
        placeholder="Can resize both ways..."
        value={value}
        onChange={setValue}
        resize="both"
      />
    </div>
  );
};

/**
 * Example 12: Form with Multiple Textareas
 * Complete form example
 */
export const FormWithTextareas = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.title) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description || formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      console.log('Form submitted:', formData);
      alert('Form submitted successfully!');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
      <Textarea
        label="Title"
        placeholder="Enter a title..."
        value={formData.title}
        onChange={(value) => setFormData({ ...formData, title: value })}
        error={errors.title}
        required
        rows={2}
        maxLength={100}
      />
      
      <Textarea
        label="Description"
        placeholder="Enter a detailed description..."
        value={formData.description}
        onChange={(value) => setFormData({ ...formData, description: value })}
        error={errors.description}
        required
        autoResize
        rows={4}
        maxLength={500}
        helperText="Provide a comprehensive description (minimum 20 characters)"
      />
      
      <Textarea
        label="Additional Notes"
        placeholder="Any additional notes..."
        value={formData.notes}
        onChange={(value) => setFormData({ ...formData, notes: value })}
        showCount
        rows={3}
        helperText="Optional field for extra information"
      />
      
      <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
        Submit
      </button>
    </form>
  );
};

/**
 * Example 13: RTL Support
 * Textarea with right-to-left text direction
 */
export const RTLTextarea = () => {
  const [value, setValue] = useState('');
  
  return (
    <div dir="rtl">
      <Textarea
        label="الوصف"
        placeholder="أدخل الوصف..."
        value={value}
        onChange={setValue}
        required
        maxLength={200}
        helperText="الرجاء إدخال وصف مفصل"
      />
    </div>
  );
};

/**
 * Example 14: Textarea with ARIA Labels
 * Demonstrates accessibility features
 */
export const AccessibleTextarea = () => {
  const [value, setValue] = useState('');
  
  return (
    <Textarea
      label="Feedback"
      placeholder="Share your feedback..."
      value={value}
      onChange={setValue}
      ariaLabel="User feedback textarea"
      ariaDescribedBy="feedback-description"
      helperText="Your feedback helps us improve our service"
      id="user-feedback"
      name="feedback"
    />
  );
};

export default {
  BasicTextarea,
  RequiredTextarea,
  TextareaWithCounter,
  TextareaWithMaxLength,
  AutoResizeTextarea,
  TextareaWithError,
  TextareaWithSuccess,
  TextareaWithWarning,
  DisabledTextarea,
  ReadOnlyTextarea,
  CustomResizeTextarea,
  FormWithTextareas,
  RTLTextarea,
  AccessibleTextarea
};
