import React, { useState } from 'react';
import StatCard from './StatCard';
import { 
  Users, 
  UserCheck, 
  CheckCircle, 
  DollarSign, 
  TrendingUp,
  BookOpen,
  Calendar,
  AlertCircle
} from 'lucide-react';
import styles from './StatCard.example.module.css';

/**
 * StatCard Component Examples
 * 
 * This file demonstrates various use cases and configurations of the StatCard component.
 */
const StatCardExample = () => {
  const [loading, setLoading] = useState(false);

  const handleCardClick = (title) => {
    alert(`Clicked on ${title}`);
  };

  const toggleLoading = () => {
    setLoading(!loading);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>StatCard Component Examples</h1>
        <button onClick={toggleLoading} className={styles.toggleButton}>
          {loading ? 'Hide Loading States' : 'Show Loading States'}
        </button>
      </div>

      {/* Basic Examples */}
      <section className={styles.section}>
        <h2>Basic Examples</h2>
        <div className={styles.grid}>
          <StatCard
            title="Total Students"
            value={485}
            icon={<Users />}
            loading={loading}
          />
          
          <StatCard
            title="Active Staff"
            value={42}
            icon={<UserCheck />}
            loading={loading}
          />
          
          <StatCard
            title="Attendance Rate"
            value={92.5}
            metricType="percentage"
            icon={<CheckCircle />}
            loading={loading}
          />
          
          <StatCard
            title="Total Revenue"
            value={125000}
            metricType="currency"
            icon={<DollarSign />}
            loading={loading}
          />
        </div>
      </section>

      {/* Color Variants */}
      <section className={styles.section}>
        <h2>Color Variants</h2>
        <div className={styles.grid}>
          <StatCard
            title="Default Variant"
            value={100}
            icon={<Users />}
            variant="default"
            loading={loading}
          />
          
          <StatCard
            title="Primary Variant"
            value={200}
            icon={<UserCheck />}
            variant="primary"
            loading={loading}
          />
          
          <StatCard
            title="Secondary Variant"
            value={300}
            icon={<BookOpen />}
            variant="secondary"
            loading={loading}
          />
          
          <StatCard
            title="Success Variant"
            value={95.5}
            metricType="percentage"
            icon={<CheckCircle />}
            variant="success"
            loading={loading}
          />
          
          <StatCard
            title="Warning Variant"
            value={75}
            metricType="percentage"
            icon={<AlertCircle />}
            variant="warning"
            loading={loading}
          />
          
          <StatCard
            title="Error Variant"
            value={12}
            icon={<AlertCircle />}
            variant="error"
            loading={loading}
          />
        </div>
      </section>

      {/* Size Variants */}
      <section className={styles.section}>
        <h2>Size Variants</h2>
        <div className={styles.grid}>
          <StatCard
            title="Small Size"
            value={50}
            icon={<Users />}
            size="small"
            loading={loading}
          />
          
          <StatCard
            title="Medium Size (Default)"
            value={100}
            icon={<UserCheck />}
            size="medium"
            loading={loading}
          />
          
          <StatCard
            title="Large Size"
            value={200}
            icon={<CheckCircle />}
            size="large"
            loading={loading}
          />
        </div>
      </section>

      {/* With Trends */}
      <section className={styles.section}>
        <h2>With Trend Indicators</h2>
        <div className={styles.grid}>
          <StatCard
            title="Positive Trend"
            value={485}
            icon={<Users />}
            variant="primary"
            trend={{
              value: 12.5,
              label: "vs last month"
            }}
            loading={loading}
          />
          
          <StatCard
            title="Negative Trend"
            value={42}
            icon={<UserCheck />}
            variant="secondary"
            trend={{
              value: -5.3,
              label: "vs last month"
            }}
            loading={loading}
          />
          
          <StatCard
            title="Neutral Trend"
            value={92.5}
            metricType="percentage"
            icon={<CheckCircle />}
            variant="success"
            trend={{
              value: 0,
              label: "no change"
            }}
            loading={loading}
          />
          
          <StatCard
            title="Trend Without Label"
            value={125000}
            metricType="currency"
            icon={<DollarSign />}
            variant="warning"
            trend={{
              value: 8.7
            }}
            loading={loading}
          />
        </div>
      </section>

      {/* With Subtitles */}
      <section className={styles.section}>
        <h2>With Subtitles</h2>
        <div className={styles.grid}>
          <StatCard
            title="Total Students"
            subtitle="Active enrollment"
            value={485}
            icon={<Users />}
            variant="primary"
            loading={loading}
          />
          
          <StatCard
            title="Teaching Staff"
            subtitle="Full-time employees"
            value={38}
            icon={<UserCheck />}
            variant="secondary"
            loading={loading}
          />
          
          <StatCard
            title="Attendance"
            subtitle="This week"
            value={92.5}
            metricType="percentage"
            icon={<CheckCircle />}
            variant="success"
            trend={{
              value: 2.1,
              label: "vs last week"
            }}
            loading={loading}
          />
        </div>
      </section>

      {/* Clickable Cards */}
      <section className={styles.section}>
        <h2>Clickable Cards (Interactive)</h2>
        <p className={styles.description}>
          Click on these cards to see the interaction. They have hover effects and are keyboard accessible.
        </p>
        <div className={styles.grid}>
          <StatCard
            title="View Students"
            value={485}
            icon={<Users />}
            variant="primary"
            onClick={() => handleCardClick('Students')}
            loading={loading}
          />
          
          <StatCard
            title="View Staff"
            value={42}
            icon={<UserCheck />}
            variant="secondary"
            onClick={() => handleCardClick('Staff')}
            loading={loading}
          />
          
          <StatCard
            title="View Attendance"
            value={92.5}
            metricType="percentage"
            icon={<CheckCircle />}
            variant="success"
            onClick={() => handleCardClick('Attendance')}
            loading={loading}
          />
          
          <StatCard
            title="View Revenue"
            value={125000}
            metricType="currency"
            icon={<DollarSign />}
            variant="warning"
            onClick={() => handleCardClick('Revenue')}
            loading={loading}
          />
        </div>
      </section>

      {/* Metric Types */}
      <section className={styles.section}>
        <h2>Metric Types</h2>
        <div className={styles.grid}>
          <StatCard
            title="Number Format"
            value={1234567}
            metricType="number"
            icon={<Users />}
            loading={loading}
          />
          
          <StatCard
            title="Percentage Format"
            value={85.5}
            metricType="percentage"
            icon={<TrendingUp />}
            loading={loading}
          />
          
          <StatCard
            title="Currency Format (USD)"
            value={12345.67}
            metricType="currency"
            currency="$"
            icon={<DollarSign />}
            loading={loading}
          />
          
          <StatCard
            title="Currency Format (EUR)"
            value={9876.54}
            metricType="currency"
            currency="€"
            icon={<DollarSign />}
            loading={loading}
          />
        </div>
      </section>

      {/* Edge Cases */}
      <section className={styles.section}>
        <h2>Edge Cases</h2>
        <div className={styles.grid}>
          <StatCard
            title="Zero Value"
            value={0}
            icon={<Users />}
            loading={loading}
          />
          
          <StatCard
            title="Negative Value"
            value={-50}
            icon={<AlertCircle />}
            variant="error"
            loading={loading}
          />
          
          <StatCard
            title="Large Number"
            value={9876543210}
            metricType="number"
            icon={<Users />}
            loading={loading}
          />
          
          <StatCard
            title="Decimal Number"
            value={123.456}
            metricType="number"
            icon={<TrendingUp />}
            loading={loading}
          />
        </div>
      </section>

      {/* Dashboard Example */}
      <section className={styles.section}>
        <h2>Dashboard Example</h2>
        <p className={styles.description}>
          A typical dashboard layout with multiple stat cards showing key metrics.
        </p>
        <div className={styles.grid}>
          <StatCard
            title="Total Students"
            subtitle="Active enrollment"
            value={485}
            icon={<Users />}
            variant="primary"
            trend={{
              value: 12.5,
              label: "vs last month"
            }}
            onClick={() => handleCardClick('Students')}
            loading={loading}
          />
          
          <StatCard
            title="Total Staff"
            subtitle="Teaching & non-teaching"
            value={42}
            icon={<UserCheck />}
            variant="secondary"
            trend={{
              value: 3,
              label: "vs last month"
            }}
            onClick={() => handleCardClick('Staff')}
            loading={loading}
          />
          
          <StatCard
            title="Attendance Rate"
            subtitle="This week"
            value={92.5}
            metricType="percentage"
            icon={<CheckCircle />}
            variant="success"
            trend={{
              value: 2.1,
              label: "vs last week"
            }}
            onClick={() => handleCardClick('Attendance')}
            loading={loading}
          />
          
          <StatCard
            title="Fee Collection"
            subtitle="This month"
            value={125000}
            metricType="currency"
            icon={<DollarSign />}
            variant="warning"
            trend={{
              value: -5.3,
              label: "vs last month"
            }}
            onClick={() => handleCardClick('Revenue')}
            loading={loading}
          />
          
          <StatCard
            title="Active Classes"
            subtitle="Current semester"
            value={24}
            icon={<BookOpen />}
            variant="primary"
            onClick={() => handleCardClick('Classes')}
            loading={loading}
          />
          
          <StatCard
            title="Upcoming Events"
            subtitle="Next 7 days"
            value={8}
            icon={<Calendar />}
            variant="secondary"
            onClick={() => handleCardClick('Events')}
            loading={loading}
          />
        </div>
      </section>
    </div>
  );
};

export default StatCardExample;
