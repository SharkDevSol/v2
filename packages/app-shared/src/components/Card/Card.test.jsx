import React from 'react';
import { render, screen } from '@testing-library/react';
import Card from './Card';
import styles from './Card.module.css';

describe('Card Component', () => {
  describe('Light Mode', () => {
    beforeEach(() => {
      document.documentElement.removeAttribute('data-theme');
      document.body.classList.remove('dark-mode');
    });

    test('renders card with title in light mode', () => {
      render(<Card title="Test Card">Content</Card>);
      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    test('renders card with subtitle in light mode', () => {
      render(<Card title="Test Card" subtitle="Test Subtitle">Content</Card>);
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });

    test('applies default variant in light mode', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass(styles.card);
      expect(card).toHaveClass(styles.default);
    });

    test('applies outlined variant in light mode', () => {
      const { container } = render(<Card variant="outlined">Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass(styles.outlined);
    });

    test('applies elevated variant in light mode', () => {
      const { container } = render(<Card variant="elevated">Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass(styles.elevated);
    });

    test('applies hoverable class in light mode', () => {
      const { container } = render(<Card hoverable>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass(styles.hoverable);
    });

    test('renders with actions in light mode', () => {
      const actions = <button>Action</button>;
      render(<Card title="Test" actions={actions}>Content</Card>);
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    test('renders with footer in light mode', () => {
      const footer = <div>Footer Content</div>;
      render(<Card footer={footer}>Content</Card>);
      expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });

    test('applies padding variants in light mode', () => {
      const { container: containerSm } = render(<Card padding="sm">Content</Card>);
      expect(containerSm.firstChild).toHaveClass(styles['padding-sm']);

      const { container: containerMd } = render(<Card padding="md">Content</Card>);
      expect(containerMd.firstChild).toHaveClass(styles['padding-md']);

      const { container: containerLg } = render(<Card padding="lg">Content</Card>);
      expect(containerLg.firstChild).toHaveClass(styles['padding-lg']);
    });

    test('applies no border class in light mode', () => {
      const { container } = render(<Card bordered={false}>Content</Card>);
      expect(container.firstChild).toHaveClass(styles.noBorder);
    });

    test('applies custom className in light mode', () => {
      const { container } = render(<Card className="custom-class">Content</Card>);
      expect(container.firstChild).toHaveClass('custom-class');
    });

    test('applies ARIA attributes in light mode', () => {
      const { container } = render(
        <Card 
          role="region" 
          ariaLabel="Test Card" 
          ariaLabelledBy="card-title"
          ariaDescribedBy="card-desc"
        >
          Content
        </Card>
      );
      const card = container.firstChild;
      expect(card).toHaveAttribute('role', 'region');
      expect(card).toHaveAttribute('aria-label', 'Test Card');
      expect(card).toHaveAttribute('aria-labelledby', 'card-title');
      expect(card).toHaveAttribute('aria-describedby', 'card-desc');
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

    test('renders card with title in dark mode', () => {
      render(<Card title="Test Card">Content</Card>);
      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    test('renders card with subtitle in dark mode', () => {
      render(<Card title="Test Card" subtitle="Test Subtitle">Content</Card>);
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });

    test('applies default variant in dark mode', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass(styles.card);
      expect(card).toHaveClass(styles.default);
    });

    test('applies outlined variant in dark mode', () => {
      const { container } = render(<Card variant="outlined">Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass(styles.outlined);
    });

    test('applies elevated variant in dark mode', () => {
      const { container } = render(<Card variant="elevated">Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass(styles.elevated);
    });

    test('applies hoverable class in dark mode', () => {
      const { container } = render(<Card hoverable>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass(styles.hoverable);
    });

    test('renders with actions in dark mode', () => {
      const actions = <button>Action</button>;
      render(<Card title="Test" actions={actions}>Content</Card>);
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    test('renders with footer in dark mode', () => {
      const footer = <div>Footer Content</div>;
      render(<Card footer={footer}>Content</Card>);
      expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });

    test('applies padding variants in dark mode', () => {
      const { container: containerSm } = render(<Card padding="sm">Content</Card>);
      expect(containerSm.firstChild).toHaveClass(styles['padding-sm']);

      const { container: containerMd } = render(<Card padding="md">Content</Card>);
      expect(containerMd.firstChild).toHaveClass(styles['padding-md']);

      const { container: containerLg } = render(<Card padding="lg">Content</Card>);
      expect(containerLg.firstChild).toHaveClass(styles['padding-lg']);
    });

    test('applies no border class in dark mode', () => {
      const { container } = render(<Card bordered={false}>Content</Card>);
      expect(container.firstChild).toHaveClass(styles.noBorder);
    });

    test('applies custom className in dark mode', () => {
      const { container } = render(<Card className="custom-class">Content</Card>);
      expect(container.firstChild).toHaveClass('custom-class');
    });

    test('applies ARIA attributes in dark mode', () => {
      const { container } = render(
        <Card 
          role="region" 
          ariaLabel="Test Card" 
          ariaLabelledBy="card-title"
          ariaDescribedBy="card-desc"
        >
          Content
        </Card>
      );
      const card = container.firstChild;
      expect(card).toHaveAttribute('role', 'region');
      expect(card).toHaveAttribute('aria-label', 'Test Card');
      expect(card).toHaveAttribute('aria-labelledby', 'card-title');
      expect(card).toHaveAttribute('aria-describedby', 'card-desc');
    });
  });

  describe('Theme Switching', () => {
    test('maintains structure when switching from light to dark mode', () => {
      const { container, rerender } = render(<Card title="Test">Content</Card>);
      
      // Light mode
      document.documentElement.removeAttribute('data-theme');
      rerender(<Card title="Test">Content</Card>);
      expect(screen.getByText('Test')).toBeInTheDocument();
      
      // Switch to dark mode
      document.documentElement.setAttribute('data-theme', 'dark');
      rerender(<Card title="Test">Content</Card>);
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(container.firstChild).toHaveClass(styles.card);
    });

    test('maintains structure when switching from dark to light mode', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      const { container, rerender } = render(<Card title="Test">Content</Card>);
      
      // Dark mode
      expect(screen.getByText('Test')).toBeInTheDocument();
      
      // Switch to light mode
      document.documentElement.removeAttribute('data-theme');
      rerender(<Card title="Test">Content</Card>);
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(container.firstChild).toHaveClass(styles.card);
    });
  });
});
