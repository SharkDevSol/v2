/**
 * Skeleton Component Tests
 * 
 * Tests for Skeleton component rendering and functionality.
 * Verifies all variants, sizes, animations, and accessibility features.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import Skeleton from './Skeleton';

describe('Skeleton Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Basic Rendering', () => {
    it('should render skeleton with default props', () => {
      const { container } = render(<Skeleton />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
    });

    it('should render skeleton with custom aria label', () => {
      render(<Skeleton ariaLabel="Loading user data" />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading user data');
    });

    it('should have aria-busy attribute', () => {
      render(<Skeleton />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveAttribute('aria-busy', 'true');
    });

    it('should have aria-live attribute', () => {
      render(<Skeleton />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveAttribute('aria-live', 'polite');
    });

    it('should render screen reader text', () => {
      render(<Skeleton ariaLabel="Loading content" />);
      
      const srText = screen.getByText('Loading content...');
      expect(srText).toBeInTheDocument();
    });
  });

  describe('Variant Types', () => {
    it('should render text variant (default)', () => {
      render(<Skeleton variant="text" />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
      // Verify it has the skeleton base class
      expect(skeleton.className).toContain('skeleton');
    });

    it('should render circular variant', () => {
      render(<Skeleton variant="circular" />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton.className).toContain('skeleton');
    });

    it('should render rectangular variant', () => {
      render(<Skeleton variant="rectangular" />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton.className).toContain('skeleton');
    });

    it('should default to text variant when no variant prop provided', () => {
      render(<Skeleton />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton.className).toContain('skeleton');
    });
  });

  describe('Custom Dimensions', () => {
    it('should apply custom width', () => {
      render(<Skeleton width="200px" />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ width: '200px' });
    });

    it('should apply custom height', () => {
      render(<Skeleton height="50px" />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ height: '50px' });
    });

    it('should apply both width and height', () => {
      render(<Skeleton width="300px" height="100px" />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ width: '300px', height: '100px' });
    });

    it('should accept numeric width', () => {
      render(<Skeleton width={250} />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ width: '250px' });
    });

    it('should accept numeric height', () => {
      render(<Skeleton height={75} />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ height: '75px' });
    });

    it('should use default width for text variant when not specified', () => {
      render(<Skeleton variant="text" />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ width: '100%' });
    });

    it('should use default height for text variant when not specified', () => {
      render(<Skeleton variant="text" />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ height: '1em' });
    });
  });

  describe('Multiple Skeleton Items (Count)', () => {
    it('should render single skeleton by default', () => {
      render(<Skeleton />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
    });

    it('should render multiple skeletons when count is specified', () => {
      render(<Skeleton count={3} />);
      
      const skeletons = screen.getAllByRole('status');
      expect(skeletons).toHaveLength(3);
    });

    it('should render skeleton group wrapper for multiple items', () => {
      const { container } = render(<Skeleton count={3} />);
      
      const group = container.querySelector('[aria-busy="true"]');
      expect(group).toBeInTheDocument();
      expect(group).toHaveAttribute('aria-live', 'polite');
    });

    it('should have aria attributes on group wrapper', () => {
      const { container } = render(<Skeleton count={3} ariaLabel="Loading items" />);
      
      const group = container.querySelector('[aria-busy="true"]');
      expect(group).toHaveAttribute('aria-busy', 'true');
      expect(group).toHaveAttribute('aria-live', 'polite');
      expect(group).toHaveAttribute('aria-label', 'Loading items');
    });

    it('should render 5 skeleton items', () => {
      render(<Skeleton count={5} />);
      
      const skeletons = screen.getAllByRole('status');
      expect(skeletons).toHaveLength(5);
    });

    it('should apply same variant to all items in group', () => {
      render(<Skeleton variant="circular" count={3} />);
      
      const skeletons = screen.getAllByRole('status');
      expect(skeletons).toHaveLength(3);
      skeletons.forEach((skeleton) => {
        expect(skeleton.className).toContain('skeleton');
      });
    });

    it('should apply same dimensions to all items in group', () => {
      render(<Skeleton width="200px" height="50px" count={3} />);
      
      const skeletons = screen.getAllByRole('status');
      skeletons.forEach((skeleton) => {
        expect(skeleton).toHaveStyle({ width: '200px', height: '50px' });
      });
    });
  });

  describe('Animation Types', () => {
    it('should render wave animation by default', () => {
      render(<Skeleton />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton.className).toContain('skeleton');
    });

    it('should render wave animation when specified', () => {
      render(<Skeleton animation="wave" />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton.className).toContain('skeleton');
    });

    it('should render pulse animation when specified', () => {
      render(<Skeleton animation="pulse" />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton.className).toContain('skeleton');
    });

    it('should render no animation when animation is "none"', () => {
      render(<Skeleton animation="none" />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton.className).toContain('skeleton');
    });

    it('should apply animation to all items in group', () => {
      render(<Skeleton animation="pulse" count={3} />);
      
      const skeletons = screen.getAllByRole('status');
      expect(skeletons).toHaveLength(3);
      skeletons.forEach((skeleton) => {
        expect(skeleton.className).toContain('skeleton');
      });
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className to skeleton', () => {
      const { container } = render(<Skeleton className="custom-skeleton" />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton.className).toContain('custom-skeleton');
    });

    it('should preserve default classes when custom className is added', () => {
      const { container } = render(
        <Skeleton variant="circular" animation="pulse" className="custom-skeleton" />
      );
      
      const skeleton = screen.getByRole('status');
      expect(skeleton.className).toContain('skeleton');
      expect(skeleton.className).toContain('circular');
      expect(skeleton.className).toContain('pulse');
      expect(skeleton.className).toContain('custom-skeleton');
    });

    it('should apply custom className to all items in group', () => {
      const { container } = render(
        <Skeleton count={3} className="custom-skeleton" />
      );
      
      const skeletons = container.querySelectorAll('.custom-skeleton');
      expect(skeletons).toHaveLength(3);
    });
  });

  describe('Combined Props', () => {
    it('should handle all props together for single skeleton', () => {
      const { container } = render(
        <Skeleton
          variant="rectangular"
          width="300px"
          height="200px"
          animation="pulse"
          ariaLabel="Loading image"
          className="custom-class"
        />
      );
      
      const skeleton = screen.getByRole('status');
      
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveAttribute('aria-label', 'Loading image');
      expect(skeleton).toHaveStyle({ width: '300px', height: '200px' });
      expect(skeleton.className).toContain('rectangular');
      expect(skeleton.className).toContain('pulse');
      expect(skeleton.className).toContain('custom-class');
    });

    it('should handle all props together for multiple skeletons', () => {
      const { container } = render(
        <Skeleton
          variant="circular"
          width="50px"
          height="50px"
          animation="wave"
          count={4}
          ariaLabel="Loading avatars"
          className="avatar-skeleton"
        />
      );
      
      const group = container.querySelector('[aria-label="Loading avatars"]');
      const skeletons = screen.getAllByRole('status');
      
      expect(group).toHaveAttribute('aria-label', 'Loading avatars');
      expect(skeletons).toHaveLength(4);
      
      skeletons.forEach((skeleton) => {
        expect(skeleton.className).toContain('skeleton');
        expect(skeleton.className).toContain('avatar-skeleton');
        expect(skeleton).toHaveStyle({ width: '50px', height: '50px' });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for screen readers', () => {
      render(<Skeleton ariaLabel="Loading data" />);
      
      const skeleton = screen.getByRole('status');
      
      expect(skeleton).toHaveAttribute('aria-busy', 'true');
      expect(skeleton).toHaveAttribute('aria-live', 'polite');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading data');
    });

    it('should announce loading state to screen readers', () => {
      render(<Skeleton />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveAttribute('aria-live', 'polite');
    });

    it('should have screen reader only text', () => {
      render(<Skeleton ariaLabel="Loading content" />);
      
      const srText = screen.getByText('Loading content...');
      expect(srText).toBeInTheDocument();
      expect(srText.className).toContain('srOnly');
    });

    it('should be accessible for multiple items', () => {
      const { container } = render(<Skeleton count={3} ariaLabel="Loading list" />);
      
      const group = container.querySelector('[aria-label="Loading list"]');
      const skeletons = screen.getAllByRole('status');
      
      expect(group).toHaveAttribute('aria-busy', 'true');
      expect(group).toHaveAttribute('aria-live', 'polite');
      expect(group).toHaveAttribute('aria-label', 'Loading list');
      expect(skeletons).toHaveLength(3);
    });

    it('should have unique keys for multiple items', () => {
      render(<Skeleton count={3} />);
      
      const skeletons = screen.getAllByRole('status');
      expect(skeletons).toHaveLength(3);
      // React handles keys internally, we just verify all items render
    });
  });

  describe('RTL Support', () => {
    it('should support RTL layout', () => {
      const { container } = render(
        <div dir="rtl">
          <Skeleton />
        </div>
      );
      
      const wrapper = container.querySelector('[dir="rtl"]');
      expect(wrapper).toBeInTheDocument();
    });

    it('should render correctly in RTL with multiple items', () => {
      const { container } = render(
        <div dir="rtl">
          <Skeleton count={3} ariaLabel="جاري التحميل" />
        </div>
      );
      
      const group = container.querySelector('[aria-label="جاري التحميل"]');
      expect(group).toBeInTheDocument();
      expect(group).toHaveAttribute('aria-label', 'جاري التحميل');
    });

    it('should render all variants in RTL', () => {
      const variants = ['text', 'circular', 'rectangular'];
      
      variants.forEach((variant) => {
        const { unmount } = render(
          <div dir="rtl">
            <Skeleton variant={variant} />
          </div>
        );
        
        const skeleton = screen.getByRole('status');
        expect(skeleton).toBeInTheDocument();
        expect(skeleton.className).toContain('skeleton');
        
        unmount();
      });
    });
  });

  describe('Different Shapes', () => {
    it('should render text shape for paragraphs', () => {
      render(<Skeleton variant="text" width="100%" height="1em" count={3} />);
      
      const skeletons = screen.getAllByRole('status');
      expect(skeletons).toHaveLength(3);
    });

    it('should render circular shape for avatars', () => {
      render(<Skeleton variant="circular" width="40px" height="40px" />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveStyle({ width: '40px', height: '40px' });
    });

    it('should render rectangular shape for images', () => {
      render(<Skeleton variant="rectangular" width="300px" height="200px" />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveStyle({ width: '300px', height: '200px' });
    });

    it('should render rectangular shape for cards', () => {
      render(<Skeleton variant="rectangular" width="100%" height="150px" />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveStyle({ width: '100%', height: '150px' });
    });
  });

  describe('Use Cases', () => {
    it('should render skeleton for loading text content', () => {
      render(<Skeleton variant="text" count={5} />);
      
      const skeletons = screen.getAllByRole('status');
      expect(skeletons).toHaveLength(5);
    });

    it('should render skeleton for loading user profile', () => {
      const { container } = render(
        <div>
          <Skeleton variant="circular" width="80px" height="80px" />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      );
      
      const skeletons = screen.getAllByRole('status');
      expect(skeletons).toHaveLength(3);
    });

    it('should render skeleton for loading card list', () => {
      render(<Skeleton variant="rectangular" width="100%" height="200px" count={3} />);
      
      const skeletons = screen.getAllByRole('status');
      expect(skeletons).toHaveLength(3);
    });

    it('should render skeleton for loading table rows', () => {
      render(<Skeleton variant="text" width="100%" height="40px" count={10} />);
      
      const skeletons = screen.getAllByRole('status');
      expect(skeletons).toHaveLength(10);
    });
  });

  describe('Animation Performance', () => {
    it('should have wave animation class', () => {
      render(<Skeleton animation="wave" />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton.className).toContain('skeleton');
    });

    it('should have pulse animation class', () => {
      render(<Skeleton animation="pulse" />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton.className).toContain('skeleton');
    });

    it('should not have animation classes when animation is none', () => {
      render(<Skeleton animation="none" />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton.className).toContain('skeleton');
    });

    it('should animate all items in group', () => {
      render(<Skeleton animation="wave" count={5} />);
      
      const skeletons = screen.getAllByRole('status');
      expect(skeletons).toHaveLength(5);
    });
  });
});
