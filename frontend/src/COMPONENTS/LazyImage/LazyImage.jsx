import React from 'react';
import styles from './LazyImage.module.css';

/**
 * Optimized image with native lazy loading and optional WebP source (Task 17.3).
 *
 * @param {Object} props
 * @param {string} props.src - Image URL (required)
 * @param {string} props.alt - Accessible alt text (required)
 * @param {string} [props.webpSrc] - WebP URL; defaults to src with .webp extension when applicable
 * @param {string} [props.className] - Additional class names for the img element
 * @param {boolean} [props.eager=false] - Set loading="eager" for above-the-fold images
 * @param {Object} [props.imgProps] - Additional props passed to img
 */
const LazyImage = ({
  src,
  alt,
  webpSrc,
  className = '',
  eager = false,
  imgProps = {},
}) => {
  if (!src) return null;

  const webp =
    webpSrc ??
    (typeof src === 'string' && /\.(jpe?g|png)(\?|$)/i.test(src)
      ? src.replace(/\.(jpe?g|png)(\?.*)?$/i, '.webp$2')
      : null);

  const imgClassName = [styles.image, className].filter(Boolean).join(' ');

  const img = (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={imgClassName}
      {...imgProps}
    />
  );

  if (webp && webp !== src) {
    return (
      <picture className={styles.picture}>
        <source srcSet={webp} type="image/webp" />
        {img}
      </picture>
    );
  }

  return img;
};

export default LazyImage;
