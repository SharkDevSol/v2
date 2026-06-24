import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Table from './Table';
import styles from './Table.module.css';

describe('Table Component', () => {
  const mockColumns = [
    { key: 'id', header: 'ID', accessor: 'id' },
    { key: 'name', header: 'Name', accessor: 'name' },
    { key: 'email', header: 'Email', accessor: 'email' },
  ];

  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
  ];

  describe('Light Mode', () => {
    beforeEach(() => {
      document.documentElement.removeAttribute('data-theme');
      document.body.classList.remove('dark-mode');
    });

    test('renders table with data in light mode', () => {
      render(<Table columns={mockColumns} data={mockData} />);
      
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    test('renders empty state when no data in light mode', () => {
      render(<Table columns={mockColumns} data={[]} emptyMessage="No records found" />);
      
      expect(screen.getByText('No records found')).toBeInTheDocument();
    });

    test('renders loading state in light mode', () => {
      render(<Table columns={mockColumns} data={mockData} loading={true} />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('applies striped class in light mode', () => {
      const { container } = render(<Table columns={mockColumns} data={mockData} striped={true} />);
      
      const tbody = container.querySelector('tbody');
      expect(tbody).toHaveClass(styles.striped);
    });

    test('applies bordered class in light mode', () => {
      const { container } = render(<Table columns={mockColumns} data={mockData} bordered={true} />);
      
      const wrapper = container.querySelector(`.${styles.tableWrapper}`);
      expect(wrapper).toHaveClass(styles.bordered);
    });

    test('handles row click in light mode', () => {
      const mockRowClick = vi.fn();
      render(<Table columns={mockColumns} data={mockData} onRowClick={mockRowClick} />);
      
      const firstRow = screen.getByText('John Doe').closest('tr');
      fireEvent.click(firstRow);
      
      expect(mockRowClick).toHaveBeenCalledWith(mockData[0]);
    });

    test('sorts data when column header is clicked in light mode', () => {
      render(<Table columns={mockColumns} data={mockData} sortable={true} />);
      
      const nameHeader = screen.getByText('Name').closest('th');
      
      // First click - ascending
      fireEvent.click(nameHeader);
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Bob Johnson');
      
      // Second click - descending
      fireEvent.click(nameHeader);
      const rowsDesc = screen.getAllByRole('row');
      expect(rowsDesc[1]).toHaveTextContent('John Doe');
    });

    test('renders custom cell content with render function in light mode', () => {
      const columnsWithRender = [
        { 
          key: 'name', 
          header: 'Name', 
          accessor: 'name',
          render: (value) => <strong>{value.toUpperCase()}</strong>
        },
      ];
      
      render(<Table columns={columnsWithRender} data={[mockData[0]]} />);
      
      expect(screen.getByText('JOHN DOE')).toBeInTheDocument();
    });

    test('applies custom className in light mode', () => {
      const { container } = render(
        <Table columns={mockColumns} data={mockData} className="custom-table" />
      );
      
      const wrapper = container.querySelector(`.${styles.tableWrapper}`);
      expect(wrapper).toHaveClass('custom-table');
    });
  });

  describe('Dark Mode', () => {
    beforeEach(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-mode');
    });

    afterEach(() => {
      document.documentElement.removeAttribute('data-theme');
      document.body.classList.remove('dark-mode');
    });

    test('renders table with data in dark mode', () => {
      render(<Table columns={mockColumns} data={mockData} />);
      
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    test('renders empty state when no data in dark mode', () => {
      render(<Table columns={mockColumns} data={[]} emptyMessage="No records found" />);
      
      expect(screen.getByText('No records found')).toBeInTheDocument();
    });

    test('renders loading state in dark mode', () => {
      render(<Table columns={mockColumns} data={mockData} loading={true} />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('applies striped class in dark mode', () => {
      const { container } = render(<Table columns={mockColumns} data={mockData} striped={true} />);
      
      const tbody = container.querySelector('tbody');
      expect(tbody).toHaveClass(styles.striped);
    });

    test('applies bordered class in dark mode', () => {
      const { container } = render(<Table columns={mockColumns} data={mockData} bordered={true} />);
      
      const wrapper = container.querySelector(`.${styles.tableWrapper}`);
      expect(wrapper).toHaveClass(styles.bordered);
    });

    test('handles row click in dark mode', () => {
      const mockRowClick = vi.fn();
      render(<Table columns={mockColumns} data={mockData} onRowClick={mockRowClick} />);
      
      const firstRow = screen.getByText('John Doe').closest('tr');
      fireEvent.click(firstRow);
      
      expect(mockRowClick).toHaveBeenCalledWith(mockData[0]);
    });

    test('sorts data when column header is clicked in dark mode', () => {
      render(<Table columns={mockColumns} data={mockData} sortable={true} />);
      
      const nameHeader = screen.getByText('Name').closest('th');
      
      // First click - ascending
      fireEvent.click(nameHeader);
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Bob Johnson');
    });
  });

  describe('Theme Switching', () => {
    test('maintains structure when switching from light to dark mode', () => {
      document.documentElement.removeAttribute('data-theme');
      
      const { rerender } = render(<Table columns={mockColumns} data={mockData} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      
      // Switch to dark mode
      document.documentElement.setAttribute('data-theme', 'dark');
      rerender(<Table columns={mockColumns} data={mockData} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    test('maintains structure when switching from dark to light mode', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      
      const { rerender } = render(<Table columns={mockColumns} data={mockData} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      
      // Switch to light mode
      document.documentElement.removeAttribute('data-theme');
      rerender(<Table columns={mockColumns} data={mockData} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    const largeData = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `Person ${i + 1}`,
      email: `person${i + 1}@example.com`,
    }));

    test('renders pagination controls when paginated is true', () => {
      render(<Table columns={mockColumns} data={largeData} paginated={true} pageSize={10} />);
      
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('Last')).toBeInTheDocument();
    });

    test('navigates to next page', () => {
      render(<Table columns={mockColumns} data={largeData} paginated={true} pageSize={10} />);
      
      expect(screen.getByText('Person 1')).toBeInTheDocument();
      expect(screen.queryByText('Person 11')).not.toBeInTheDocument();
      
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      
      expect(screen.queryByText('Person 1')).not.toBeInTheDocument();
      expect(screen.getByText('Person 11')).toBeInTheDocument();
    });

    test('disables first and previous buttons on first page', () => {
      render(<Table columns={mockColumns} data={largeData} paginated={true} pageSize={10} />);
      
      const firstButton = screen.getByText('First');
      const previousButton = screen.getByText('Previous');
      
      expect(firstButton).toBeDisabled();
      expect(previousButton).toBeDisabled();
    });
  });

  describe('Filtering', () => {
    test('renders search input when filterable is true', () => {
      render(<Table columns={mockColumns} data={mockData} filterable={true} />);
      
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    test('filters data based on search input', () => {
      render(<Table columns={mockColumns} data={mockData} filterable={true} />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'Jane' } });
      
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    });

    test('shows result count', () => {
      render(<Table columns={mockColumns} data={mockData} filterable={true} />);
      
      expect(screen.getByText('3 results')).toBeInTheDocument();
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'Jane' } });
      
      expect(screen.getByText('1 result')).toBeInTheDocument();
    });

    test('clears filter when clear button is clicked', () => {
      render(<Table columns={mockColumns} data={mockData} filterable={true} />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'Jane' } });
      
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      
      const clearButton = screen.getByLabelText('Clear search');
      fireEvent.click(clearButton);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(searchInput.value).toBe('');
    });
  });

  describe('Selection', () => {
    test('renders checkboxes when selectable is true', () => {
      render(<Table columns={mockColumns} data={mockData} selectable={true} />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    test('selects individual row', () => {
      const mockSelectionChange = vi.fn();
      render(
        <Table 
          columns={mockColumns} 
          data={mockData} 
          selectable={true}
          onSelectionChange={mockSelectionChange}
        />
      );
      
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // First data row checkbox
      
      expect(mockSelectionChange).toHaveBeenCalledWith([0]);
    });

    test('selects all rows when select all is clicked', () => {
      const mockSelectionChange = vi.fn();
      render(
        <Table 
          columns={mockColumns} 
          data={mockData} 
          selectable={true}
          onSelectionChange={mockSelectionChange}
        />
      );
      
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(selectAllCheckbox);
      
      expect(mockSelectionChange).toHaveBeenCalledWith([0, 1, 2]);
    });

    test('uses radio buttons in single selection mode', () => {
      render(
        <Table 
          columns={mockColumns} 
          data={mockData} 
          selectable={true}
          selectionMode="single"
        />
      );
      
      const radios = screen.getAllByRole('radio');
      expect(radios.length).toBe(3); // One for each row
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA roles', () => {
      render(<Table columns={mockColumns} data={mockData} />);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('row').length).toBeGreaterThan(0);
      expect(screen.getAllByRole('columnheader').length).toBe(3);
    });

    test('has proper ARIA labels for sort state', () => {
      render(<Table columns={mockColumns} data={mockData} sortable={true} />);
      
      const nameHeader = screen.getByText('Name').closest('th');
      expect(nameHeader).toHaveAttribute('aria-sort', 'none');
      
      fireEvent.click(nameHeader);
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
      
      fireEvent.click(nameHeader);
      expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
    });

    test('has proper ARIA labels for pagination', () => {
      const largeData = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `Person ${i + 1}`,
        email: `person${i + 1}@example.com`,
      }));
      
      render(<Table columns={mockColumns} data={largeData} paginated={true} pageSize={10} />);
      
      expect(screen.getByLabelText('Go to first page')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to last page')).toBeInTheDocument();
    });
  });
});
