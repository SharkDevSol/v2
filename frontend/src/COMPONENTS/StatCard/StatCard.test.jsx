import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Users, TrendingUp, TrendingDown } from 'lucide-react';
import StatCard from './StatCard';

describe('StatCard Component', () => {
  const defaultProps = {
    title: 'Total Students',
    value: 485,
    icon: <Users data-testid="icon" />
  };

  describe('Basic Rendering', () => {
    it('should render with required props', () => {
      render(<StatCard {...defaultProps} />);
      
      expect(screen.getByText('Total Students')).toBeInTheDocument();
      expect(screen.getByText('485')).toBeInTheDocument();
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('should render with subtitle', () => {
      render(<StatCard {...defaultProps} subtitle="Active students" />);
      
      expect(screen.getByText('Active students')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<StatCard {...defaultProps} className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Metric Types', () => {
    it('should format number values correctly', () => {
      render(<StatCard {...defaultProps} value={1234567} metricType="number" />);
      
      expect(screen.getByText('1,234,567')).toBeInTheDocument();
    });

    it('should format percentage values correctly', () => {
      render(<StatCard {...defaultProps} value={85.5} metricType="percentage" />);
      
      expect(screen.getByText('85.5%')).toBeInTheDocument();
    });

    it('should format currency values correctly with default symbol', () => {
      render(<StatCard {...defaultProps} value={12345.67} metricType="currency" />);
      
      expect(screen.getByText('$12,345.67')).toBeInTheDocument();
    });

    it('should format currency values with custom symbol', () => {
      render(<StatCard {...defaultProps} value={12345.67} metricType="currency" currency="€" />);
      
      expect(screen.getByText('€12,345.67')).toBeInTheDocument();
    });

    it('should handle string values for currency', () => {
      render(<StatCard {...defaultProps} value="$1,234.56" metricType="currency" />);
      
      expect(screen.getByText('$1,234.56')).toBeInTheDocument();
    });

    it('should handle invalid values gracefully', () => {
      render(<StatCard {...defaultProps} value="N/A" metricType="number" />);
      
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should apply small size class', () => {
      const { container } = render(<StatCard {...defaultProps} size="small" />);
      
      expect(container.firstChild.className).toContain('small');
    });

    it('should apply medium size class by default', () => {
      const { container } = render(<StatCard {...defaultProps} />);
      
      expect(container.firstChild.className).toContain('medium');
    });

    it('should apply large size class', () => {
      const { container } = render(<StatCard {...defaultProps} size="large" />);
      
      expect(container.firstChild.className).toContain('large');
    });
  });

  describe('Color Variants', () => {
    it('should apply default variant class', () => {
      const { container } = render(<StatCard {...defaultProps} />);
      
      expect(container.firstChild.className).toContain('default');
    });

    it('should apply primary variant class', () => {
      const { container } = render(<StatCard {...defaultProps} variant="primary" />);
      
      expect(container.firstChild.className).toContain('primary');
    });

    it('should apply success variant class', () => {
      const { container } = render(<StatCard {...defaultProps} variant="success" />);
      
      expect(container.firstChild.className).toContain('success');
    });

    it('should apply warning variant class', () => {
      const { container } = render(<StatCard {...defaultProps} variant="warning" />);
      
      expect(container.firstChild.className).toContain('warning');
    });

    it('should apply error variant class', () => {
      const { container } = render(<StatCard {...defaultProps} variant="error" />);
      
      expect(container.firstChild.className).toContain('error');
    });
  });

  describe('Trend Indicators', () => {
    it('should render positive trend with up arrow', () => {
      render(
        <StatCard
          {...defaultProps}
          trend={{ value: 12.5, label: 'vs last month' }}
        />
      );
      
      expect(screen.getByText('12.5%')).toBeInTheDocument();
      expect(screen.getByText('vs last month')).toBeInTheDocument();
      expect(screen.getByLabelText(/trend: up 12.5 percent/i)).toBeInTheDocument();
    });

    it('should render negative trend with down arrow', () => {
      render(
        <StatCard
          {...defaultProps}
          trend={{ value: -8.3, label: 'vs last month' }}
        />
      );
      
      expect(screen.getByText('8.3%')).toBeInTheDocument();
      expect(screen.getByLabelText(/trend: down 8.3 percent/i)).toBeInTheDocument();
    });

    it('should render trend without label', () => {
      render(
        <StatCard
          {...defaultProps}
          trend={{ value: 5.2 }}
        />
      );
      
      expect(screen.getByText('5.2%')).toBeInTheDocument();
      expect(screen.queryByText('vs last month')).not.toBeInTheDocument();
    });

    it('should use explicit direction when provided', () => {
      render(
        <StatCard
          {...defaultProps}
          trend={{ value: 10, direction: 'down' }}
        />
      );
      
      expect(screen.getByLabelText(/trend: down 10 percent/i)).toBeInTheDocument();
    });

    it('should handle zero trend as neutral', () => {
      render(
        <StatCard
          {...defaultProps}
          trend={{ value: 0 }}
        />
      );
      
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should render loading skeleton when loading is true', () => {
      render(<StatCard {...defaultProps} loading={true} />);
      
      expect(screen.getByLabelText('Loading statistics')).toBeInTheDocument();
      expect(screen.queryByText('Total Students')).not.toBeInTheDocument();
    });

    it('should render content when loading is false', () => {
      render(<StatCard {...defaultProps} loading={false} />);
      
      expect(screen.getByText('Total Students')).toBeInTheDocument();
      expect(screen.queryByLabelText('Loading statistics')).not.toBeInTheDocument();
    });

    it('should have aria-busy attribute when loading', () => {
      const { container } = render(<StatCard {...defaultProps} loading={true} />);
      
      expect(container.firstChild).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Click Interaction', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<StatCard {...defaultProps} onClick={handleClick} />);
      
      const card = screen.getByRole('button');
      fireEvent.click(card);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should have button role when clickable', () => {
      const handleClick = vi.fn();
      render(<StatCard {...defaultProps} onClick={handleClick} />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should have article role when not clickable', () => {
      render(<StatCard {...defaultProps} />);
      
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('should be keyboard accessible with Enter key', () => {
      const handleClick = vi.fn();
      render(<StatCard {...defaultProps} onClick={handleClick} />);
      
      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should be keyboard accessible with Space key', () => {
      const handleClick = vi.fn();
      render(<StatCard {...defaultProps} onClick={handleClick} />);
      
      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: ' ', code: 'Space' });
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when loading', () => {
      const handleClick = vi.fn();
      render(<StatCard {...defaultProps} onClick={handleClick} loading={true} />);
      
      const card = screen.getByLabelText('Loading statistics').parentElement;
      fireEvent.click(card);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should have tabIndex when clickable', () => {
      const handleClick = vi.fn();
      render(<StatCard {...defaultProps} onClick={handleClick} />);
      
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label for basic card', () => {
      render(<StatCard {...defaultProps} />);
      
      expect(screen.getByLabelText('Total Students: 485')).toBeInTheDocument();
    });

    it('should have proper aria-label with trend', () => {
      render(
        <StatCard
          {...defaultProps}
          trend={{ value: 12.5 }}
        />
      );
      
      expect(screen.getByLabelText(/Total Students: 485, trend up 12.5%/i)).toBeInTheDocument();
    });

    it('should accept custom aria-label', () => {
      render(<StatCard {...defaultProps} ariaLabel="Custom label for students" />);
      
      expect(screen.getByLabelText('Custom label for students')).toBeInTheDocument();
    });

    it('should have aria-hidden on decorative elements', () => {
      render(<StatCard {...defaultProps} />);
      
      const iconWrapper = screen.getByTestId('icon').parentElement;
      expect(iconWrapper).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have descriptive aria-label on value', () => {
      render(<StatCard {...defaultProps} value={485} />);
      
      expect(screen.getByLabelText('Value: 485')).toBeInTheDocument();
    });

    it('should have descriptive aria-label on trend', () => {
      render(
        <StatCard
          {...defaultProps}
          trend={{ value: 12.5 }}
        />
      );
      
      expect(screen.getByLabelText('Trend: up 12.5 percent')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null value gracefully', () => {
      render(<StatCard {...defaultProps} value={null} />);
      
      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('should handle undefined value gracefully', () => {
      render(<StatCard {...defaultProps} value={undefined} />);
      
      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('should handle zero value', () => {
      render(<StatCard {...defaultProps} value={0} />);
      
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle negative values', () => {
      render(<StatCard {...defaultProps} value={-50} />);
      
      expect(screen.getByText('-50')).toBeInTheDocument();
    });

    it('should handle very large numbers', () => {
      render(<StatCard {...defaultProps} value={1234567890} metricType="number" />);
      
      expect(screen.getByText('1,234,567,890')).toBeInTheDocument();
    });

    it('should handle decimal numbers', () => {
      render(<StatCard {...defaultProps} value={123.456} metricType="number" />);
      
      expect(screen.getByText('123.456')).toBeInTheDocument();
    });
  });

  describe('RTL Support', () => {
    it('should render correctly in RTL mode', () => {
      const { container } = render(
        <div dir="rtl">
          <StatCard {...defaultProps} />
        </div>
      );
      
      expect(container.querySelector('[dir="rtl"]')).toBeInTheDocument();
    });
  });
});
