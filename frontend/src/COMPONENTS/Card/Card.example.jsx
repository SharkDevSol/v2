/**
 * Card Component Usage Examples
 * 
 * This file demonstrates various ways to use the Card component
 * with different props and configurations.
 */

import React from 'react';
import Card from './Card';
import Button from '../Button/Button';

/**
 * Example 1: Basic Card
 * Simple card with just content
 */
export const BasicCard = () => (
  <Card>
    <p>This is a basic card with default styling.</p>
  </Card>
);

/**
 * Example 2: Card with Title and Subtitle
 * Card with header section
 */
export const CardWithHeader = () => (
  <Card 
    title="Card Title" 
    subtitle="This is a subtitle describing the card content"
  >
    <p>Card body content goes here.</p>
  </Card>
);

/**
 * Example 3: Card with Header Actions
 * Card with action buttons in the header
 */
export const CardWithActions = () => (
  <Card 
    title="User Profile" 
    subtitle="Manage your account settings"
    actions={
      <>
        <Button variant="ghost" size="small">Edit</Button>
        <Button variant="primary" size="small">Save</Button>
      </>
    }
  >
    <p>Profile information and settings...</p>
  </Card>
);

/**
 * Example 4: Card with Footer
 * Card with footer section for additional actions or info
 */
export const CardWithFooter = () => (
  <Card 
    title="Article Title"
    footer={
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Last updated: 2 hours ago</span>
        <Button variant="secondary" size="small">Read More</Button>
      </div>
    }
  >
    <p>Article preview text goes here...</p>
  </Card>
);

/**
 * Example 5: Card Variants
 * Demonstrates different visual variants
 */
export const CardVariants = () => (
  <div style={{ display: 'grid', gap: '20px' }}>
    <Card variant="default" title="Default Card">
      Standard card with subtle shadow and border.
    </Card>
    
    <Card variant="outlined" title="Outlined Card">
      Card with prominent border and no shadow.
    </Card>
    
    <Card variant="elevated" title="Elevated Card">
      Card with larger shadow and no border for a floating effect.
    </Card>
  </div>
);

/**
 * Example 6: Padding Variants
 * Demonstrates different padding sizes
 */
export const CardPaddingVariants = () => (
  <div style={{ display: 'grid', gap: '20px' }}>
    <Card padding="none" title="No Padding">
      Content with no padding (header and footer have padding).
    </Card>
    
    <Card padding="sm" title="Small Padding">
      Content with small padding (12px).
    </Card>
    
    <Card padding="md" title="Medium Padding (Default)">
      Content with medium padding (20px).
    </Card>
    
    <Card padding="lg" title="Large Padding">
      Content with large padding (32px).
    </Card>
  </div>
);

/**
 * Example 7: Hoverable Card
 * Card with hover effect for interactive elements
 */
export const HoverableCard = () => (
  <Card 
    hoverable 
    title="Click Me"
    onClick={() => alert('Card clicked!')}
    style={{ cursor: 'pointer' }}
  >
    <p>This card has a hover effect. Try hovering over it!</p>
  </Card>
);

/**
 * Example 8: Card without Border
 * Card with border disabled
 */
export const CardWithoutBorder = () => (
  <Card 
    bordered={false}
    title="Borderless Card"
  >
    <p>This card has no border, useful for seamless layouts.</p>
  </Card>
);

/**
 * Example 9: Complex Card
 * Card with all features combined
 */
export const ComplexCard = () => (
  <Card 
    title="Dashboard Statistics"
    subtitle="Overview of key metrics"
    variant="elevated"
    padding="lg"
    hoverable
    actions={
      <Button variant="ghost" size="small">Refresh</Button>
    }
    footer={
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Updated 5 minutes ago
        </span>
        <Button variant="primary" size="small">View Details</Button>
      </div>
    }
  >
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Total Users</h4>
        <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>1,234</p>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Active Sessions</h4>
        <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>567</p>
      </div>
    </div>
  </Card>
);

/**
 * Example 10: Accessible Card
 * Card with proper ARIA attributes
 */
export const AccessibleCard = () => (
  <Card 
    title="Accessible Card"
    role="article"
    ariaLabel="User notification card"
    ariaDescribedBy="card-description"
  >
    <p id="card-description">
      This card includes proper ARIA attributes for screen readers.
    </p>
  </Card>
);

/**
 * Example 11: Grid of Cards
 * Multiple cards in a responsive grid layout
 */
export const CardGrid = () => (
  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
    gap: '20px' 
  }}>
    <Card title="Card 1" variant="default">
      Content for card 1
    </Card>
    <Card title="Card 2" variant="outlined">
      Content for card 2
    </Card>
    <Card title="Card 3" variant="elevated">
      Content for card 3
    </Card>
    <Card title="Card 4" hoverable>
      Content for card 4
    </Card>
  </div>
);

/**
 * Example 12: Card with Custom Styling
 * Card with additional custom CSS classes
 */
export const CustomStyledCard = () => (
  <Card 
    title="Custom Styled Card"
    className="my-custom-card"
    style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}
  >
    <p>This card has custom styling applied.</p>
  </Card>
);

// Export all examples as a collection
export const CardExamples = {
  BasicCard,
  CardWithHeader,
  CardWithActions,
  CardWithFooter,
  CardVariants,
  CardPaddingVariants,
  HoverableCard,
  CardWithoutBorder,
  ComplexCard,
  AccessibleCard,
  CardGrid,
  CustomStyledCard,
};

export default CardExamples;
