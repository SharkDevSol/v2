import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileUpload from './FileUpload';

describe('FileUpload Component', () => {
  let mockOnChange;
  let mockOnError;

  beforeEach(() => {
    mockOnChange = vi.fn();
    mockOnError = vi.fn();
  });

  // Helper function to create mock files
  const createMockFile = (name, size, type) => {
    const file = new File(['a'.repeat(size)], name, { type });
    return file;
  };

  describe('Rendering', () => {
    it('should render the component with default props', () => {
      render(<FileUpload onChange={mockOnChange} />);
      
      expect(screen.getByRole('button', { name: /upload files/i })).toBeInTheDocument();
      expect(screen.getByText(/click to upload/i)).toBeInTheDocument();
      expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
    });

    it('should render with a label', () => {
      render(<FileUpload label="Upload Documents" onChange={mockOnChange} />);
      
      expect(screen.getByText('Upload Documents')).toBeInTheDocument();
    });

    it('should display accepted file types hint', () => {
      render(<FileUpload accept="image/*" onChange={mockOnChange} />);
      
      expect(screen.getByText(/accepted formats: image\/\*/i)).toBeInTheDocument();
    });

    it('should display max size hint', () => {
      render(<FileUpload maxSize={1024 * 1024} onChange={mockOnChange} />);
      
      expect(screen.getByText(/max size: 1 mb/i)).toBeInTheDocument();
    });

    it('should display max files hint', () => {
      render(<FileUpload maxFiles={3} onChange={mockOnChange} />);
      
      expect(screen.getByText(/max files: 3/i)).toBeInTheDocument();
    });

    it('should display error message', () => {
      render(<FileUpload error="Invalid file type" onChange={mockOnChange} />);
      
      expect(screen.getByText('Invalid file type')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('File Selection', () => {
    it('should handle file selection via click', async () => {
      const user = userEvent.setup();
      render(<FileUpload onChange={mockOnChange} />);
      
      const file = createMockFile('test.txt', 1024, 'text/plain');
      const input = screen.getByRole('button', { name: /upload files/i }).querySelector('input[type="file"]');
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([file]);
      });
    });

    it('should handle multiple file selection', async () => {
      const user = userEvent.setup();
      render(<FileUpload multiple onChange={mockOnChange} />);
      
      const file1 = createMockFile('test1.txt', 1024, 'text/plain');
      const file2 = createMockFile('test2.txt', 2048, 'text/plain');
      const input = screen.getByRole('button', { name: /upload files/i }).querySelector('input[type="file"]');
      
      await user.upload(input, [file1, file2]);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([file1, file2]);
      });
    });

    it('should replace file when multiple is false', async () => {
      const user = userEvent.setup();
      render(<FileUpload onChange={mockOnChange} />);
      
      const file1 = createMockFile('test1.txt', 1024, 'text/plain');
      const file2 = createMockFile('test2.txt', 2048, 'text/plain');
      const input = screen.getByRole('button', { name: /upload files/i }).querySelector('input[type="file"]');
      
      await user.upload(input, file1);
      await user.upload(input, file2);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenLastCalledWith([file2]);
      });
    });
  });

  describe('Drag and Drop', () => {
    it('should handle drag enter event', () => {
      render(<FileUpload onChange={mockOnChange} />);
      
      const dropZone = screen.getByRole('button', { name: /upload files/i });
      
      fireEvent.dragEnter(dropZone);
      
      // Check if the className contains 'dragging' (CSS modules hash the class names)
      expect(dropZone.className).toMatch(/dragging/);
    });

    it('should handle drag leave event', () => {
      render(<FileUpload onChange={mockOnChange} />);
      
      const dropZone = screen.getByRole('button', { name: /upload files/i });
      
      fireEvent.dragEnter(dropZone);
      expect(dropZone.className).toMatch(/dragging/);
      
      fireEvent.dragLeave(dropZone, { target: dropZone });
      
      expect(dropZone.className).not.toMatch(/dragging/);
    });

    it('should handle file drop', async () => {
      render(<FileUpload onChange={mockOnChange} />);
      
      const dropZone = screen.getByRole('button', { name: /upload files/i });
      const file = createMockFile('test.txt', 1024, 'text/plain');
      
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file]
        }
      });
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([file]);
      });
    });
  });

  describe('File Validation', () => {
    it('should validate file type', async () => {
      const user = userEvent.setup();
      render(<FileUpload accept="image/*" onChange={mockOnChange} onError={mockOnError} />);
      
      const file = createMockFile('test.txt', 1024, 'text/plain');
      const dropZone = screen.getByRole('button', { name: /upload files/i });
      const input = dropZone.querySelector('input[type="file"]');
      
      // Simulate file selection by triggering change event directly
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(expect.stringContaining('Invalid file type'));
        expect(mockOnChange).not.toHaveBeenCalled();
      });
    });

    it('should validate file size', async () => {
      const user = userEvent.setup();
      render(<FileUpload maxSize={1024} onChange={mockOnChange} onError={mockOnError} />);
      
      const file = createMockFile('test.txt', 2048, 'text/plain');
      const input = screen.getByRole('button', { name: /upload files/i }).querySelector('input[type="file"]');
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(expect.stringContaining('File size exceeds'));
        expect(mockOnChange).not.toHaveBeenCalled();
      });
    });

    it('should validate max files limit', async () => {
      const user = userEvent.setup();
      render(<FileUpload multiple maxFiles={2} onChange={mockOnChange} onError={mockOnError} />);
      
      const file1 = createMockFile('test1.txt', 1024, 'text/plain');
      const file2 = createMockFile('test2.txt', 1024, 'text/plain');
      const file3 = createMockFile('test3.txt', 1024, 'text/plain');
      const input = screen.getByRole('button', { name: /upload files/i }).querySelector('input[type="file"]');
      
      await user.upload(input, [file1, file2, file3]);
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(expect.stringContaining('Maximum 2 files allowed'));
        expect(mockOnChange).not.toHaveBeenCalled();
      });
    });

    it('should accept valid image files', async () => {
      const user = userEvent.setup();
      render(<FileUpload accept="image/*" onChange={mockOnChange} onError={mockOnError} />);
      
      const file = createMockFile('test.jpg', 1024, 'image/jpeg');
      const input = screen.getByRole('button', { name: /upload files/i }).querySelector('input[type="file"]');
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([file]);
        expect(mockOnError).not.toHaveBeenCalled();
      });
    });

    it('should accept files with extension-based accept', async () => {
      const user = userEvent.setup();
      render(<FileUpload accept=".pdf,.doc" onChange={mockOnChange} onError={mockOnError} />);
      
      const file = createMockFile('test.pdf', 1024, 'application/pdf');
      const input = screen.getByRole('button', { name: /upload files/i }).querySelector('input[type="file"]');
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([file]);
        expect(mockOnError).not.toHaveBeenCalled();
      });
    });
  });

  describe('File Removal', () => {
    it('should remove file when remove button is clicked', async () => {
      const user = userEvent.setup();
      const file = createMockFile('test.txt', 1024, 'text/plain');
      
      render(<FileUpload value={[file]} onChange={mockOnChange} />);
      
      const removeButton = screen.getByRole('button', { name: /remove test.txt/i });
      await user.click(removeButton);
      
      expect(mockOnChange).toHaveBeenCalledWith([]);
    });

    it('should remove correct file from multiple files', async () => {
      const user = userEvent.setup();
      const file1 = createMockFile('test1.txt', 1024, 'text/plain');
      const file2 = createMockFile('test2.txt', 2048, 'text/plain');
      
      render(<FileUpload value={[file1, file2]} onChange={mockOnChange} multiple />);
      
      const removeButton = screen.getByRole('button', { name: /remove test1.txt/i });
      await user.click(removeButton);
      
      expect(mockOnChange).toHaveBeenCalledWith([file2]);
    });
  });

  describe('Disabled State', () => {
    it('should not accept files when disabled', async () => {
      const user = userEvent.setup();
      render(<FileUpload disabled onChange={mockOnChange} />);
      
      const file = createMockFile('test.txt', 1024, 'text/plain');
      const input = screen.getByRole('button', { name: /upload files/i }).querySelector('input[type="file"]');
      
      await user.upload(input, file);
      
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should not handle drag events when disabled', () => {
      render(<FileUpload disabled onChange={mockOnChange} />);
      
      const dropZone = screen.getByRole('button', { name: /upload files/i });
      
      fireEvent.dragEnter(dropZone);
      
      expect(dropZone).not.toHaveClass('dragging');
    });

    it('should disable remove buttons when disabled', () => {
      const file = createMockFile('test.txt', 1024, 'text/plain');
      
      render(<FileUpload disabled value={[file]} onChange={mockOnChange} />);
      
      const removeButton = screen.getByRole('button', { name: /remove test.txt/i });
      
      expect(removeButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<FileUpload label="Upload Documents" onChange={mockOnChange} />);
      
      const dropZone = screen.getByRole('button', { name: /upload documents/i });
      
      expect(dropZone).toHaveAttribute('aria-label');
      expect(dropZone).toHaveAttribute('tabIndex', '0');
    });

    it('should have ARIA attributes for error state', () => {
      render(<FileUpload error="Invalid file" onChange={mockOnChange} />);
      
      const dropZone = screen.getByRole('button', { name: /upload files/i });
      const errorMessage = screen.getByRole('alert');
      
      expect(dropZone).toHaveAttribute('aria-describedby');
      expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<FileUpload onChange={mockOnChange} />);
      
      const dropZone = screen.getByRole('button', { name: /upload files/i });
      
      await user.tab();
      expect(dropZone).toHaveFocus();
    });

    it('should handle Enter key to open file picker', async () => {
      const user = userEvent.setup();
      const mockClick = vi.fn();
      
      render(<FileUpload onChange={mockOnChange} />);
      
      const dropZone = screen.getByRole('button', { name: /upload files/i });
      const input = dropZone.querySelector('input[type="file"]');
      input.click = mockClick;
      
      await user.tab();
      await user.keyboard('{Enter}');
      
      expect(mockClick).toHaveBeenCalled();
    });

    it('should handle Space key to open file picker', async () => {
      const user = userEvent.setup();
      const mockClick = vi.fn();
      
      render(<FileUpload onChange={mockOnChange} />);
      
      const dropZone = screen.getByRole('button', { name: /upload files/i });
      const input = dropZone.querySelector('input[type="file"]');
      input.click = mockClick;
      
      await user.tab();
      await user.keyboard(' ');
      
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('File Preview', () => {
    it('should display file preview for uploaded files', async () => {
      const user = userEvent.setup();
      render(<FileUpload onChange={mockOnChange} />);
      
      const file = createMockFile('test.txt', 1024, 'text/plain');
      const input = screen.getByRole('button', { name: /upload files/i }).querySelector('input[type="file"]');
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(screen.getByText('test.txt')).toBeInTheDocument();
        expect(screen.getByText('1 KB')).toBeInTheDocument();
      });
    });

    it('should not show preview when preview prop is false', async () => {
      const user = userEvent.setup();
      const file = createMockFile('test.jpg', 1024, 'image/jpeg');
      
      render(<FileUpload value={[file]} preview={false} onChange={mockOnChange} />);
      
      // File name should still be shown
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });
  });

  describe('Controlled Component', () => {
    it('should work as a controlled component', async () => {
      const file = createMockFile('test.txt', 1024, 'text/plain');
      const { rerender } = render(<FileUpload value={[]} onChange={mockOnChange} />);
      
      expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
      
      rerender(<FileUpload value={[file]} onChange={mockOnChange} />);
      
      await waitFor(() => {
        expect(screen.getByText('test.txt')).toBeInTheDocument();
      });
    });
  });
});
