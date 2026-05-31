import React from 'react';
import PropTypes from 'prop-types';
import styles from './Footer.module.css';

/**
 * Footer component
 * Displays page footer with copyright and optional links
 * 
 * @param {Object} props - Component props
 * @param {string} props.copyright - Copyright text
 * @param {Array} props.links - Optional footer links
 * @param {string} props.className - Additional CSS classes
 */
const Footer = ({
  copyright = `© ${new Date().getFullYear()} Skoolific. All rights reserved.`,
  links = [],
  className = ''
}) => {
  const footerClasses = [
    styles.footer,
    className
  ].filter(Boolean).join(' ');

  return (
    <footer className={footerClasses} role="contentinfo">
      <div className={styles.footerContent}>
        <p className={styles.copyright}>
          {copyright}
        </p>
        {links.length > 0 && (
          <nav className={styles.footerLinks} aria-label="Footer navigation">
            {links.map((link, index) => (
              <React.Fragment key={link.label}>
                {index > 0 && <span className={styles.separator}>•</span>}
                {link.href ? (
                  <a
                    href={link.href}
                    className={styles.footerLink}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                  >
                    {link.label}
                  </a>
                ) : (
                  <button
                    className={styles.footerLink}
                    onClick={link.onClick}
                  >
                    {link.label}
                  </button>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>
    </footer>
  );
};

Footer.propTypes = {
  copyright: PropTypes.string,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
      onClick: PropTypes.func,
      external: PropTypes.bool
    })
  ),
  className: PropTypes.string
};

export default Footer;
