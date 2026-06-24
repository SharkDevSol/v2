import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LazyImage from './LazyImage';

describe('LazyImage', () => {
  it('renders img with lazy loading by default', () => {
    render(<LazyImage src="/test.jpg" alt="Test" />);
    const img = screen.getByRole('img', { name: 'Test' });
    expect(img).toHaveAttribute('src', '/test.jpg');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('renders picture with webp source when extension allows', () => {
    const { container } = render(
      <LazyImage src="/photo.png" alt="Photo" />
    );
    expect(container.querySelector('picture')).toBeTruthy();
    expect(container.querySelector('source[type="image/webp"]')).toBeTruthy();
  });
});
