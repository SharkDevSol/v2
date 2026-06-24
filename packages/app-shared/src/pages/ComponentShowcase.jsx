import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Edit, Trash2, Plus, User, Mail, Lock, CheckCircle } from 'lucide-react';
import Button from '../COMPONENTS/Button/Button';
import Input from '../COMPONENTS/Input/Input';
import Card from '../COMPONENTS/Card/Card';
import Modal from '../COMPONENTS/Modal/Modal';
import Table from '../COMPONENTS/Table/Table';
import ThemeToggle from '../COMPONENTS/ThemeToggle/ThemeToggle';
import LanguageSelector from '../COMPONENTS/LanguageSelector/LanguageSelector';
import LoadingSpinner from '../COMPONENTS/LoadingSpinner/LoadingSpinner';
import Skeleton from '../COMPONENTS/Skeleton/Skeleton';
import Toast from '../COMPONENTS/Toast/Toast';
import Badge from '../COMPONENTS/Badge/Badge';
import Select from '../COMPONENTS/Select/Select';
import Checkbox from '../COMPONENTS/Checkbox/Checkbox';
import Radio from '../COMPONENTS/Radio/Radio';
import Textarea from '../COMPONENTS/Textarea/Textarea';
import StatCard from '../COMPONENTS/StatCard/StatCard';
import LazyImage from '../COMPONENTS/LazyImage';
import { Users, TrendingUp } from 'lucide-react';
import styles from './ComponentShowcase.module.css';

/**
 * Component Showcase Page
 * Demonstrates all UI components in the design system
 */
const ComponentShowcase = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState('info');
  const [showLoading, setShowLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  
  // Form component states
  const [selectValue, setSelectValue] = useState('');
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [radioValue, setRadioValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4' },
    { value: 'option5', label: 'Option 5' }
  ];

  // Sample table data
  const tableColumns = [
    { header: 'ID', accessor: 'id', width: '80px' },
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => (
        <span className={`${styles.badge} ${styles[row.status]}`}>
          {row.status}
        </span>
      )
    }
  ];

  const tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'inactive' }
  ];

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.length < 3) {
      setInputError('Must be at least 3 characters');
    } else {
      setInputError('');
    }
  };

  return (
    <div className={styles.showcase}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>UI Component Showcase</h1>
          <p className={styles.subtitle}>
            Explore all components in the Skoolific V2 design system
          </p>
        </div>
        <div className={styles.headerActions}>
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>

      {/* Stat Cards */}
      <Card title="Stat Cards" subtitle="Dashboard metrics with trends">
        <div className={styles.statGrid}>
          <StatCard
            title="Total Students"
            value="1,248"
            icon={<Users size={24} />}
            trend={{ value: 12, direction: 'up' }}
            color="primary"
          />
          <StatCard
            title="Attendance Rate"
            value="94%"
            icon={<TrendingUp size={24} />}
            trend={{ value: 3, direction: 'up' }}
            color="success"
          />
        </div>
      </Card>

      {/* Lazy Image */}
      <Card title="Lazy Image" subtitle="Native lazy loading with optional WebP">
        <LazyImage
          src="https://picsum.photos/seed/skoolific/400/200"
          alt="Sample lazy-loaded image"
          className={styles.sampleImage}
        />
      </Card>

      {/* Buttons Section */}
      <Card title="Buttons" subtitle="Various button styles and states">
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Variants</h3>
          <div className={styles.buttonGroup}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Sizes</h3>
          <div className={styles.buttonGroup}>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>With Icons</h3>
          <div className={styles.buttonGroup}>
            <Button icon={<Save size={18} />}>Save</Button>
            <Button variant="secondary" icon={<Edit size={18} />}>Edit</Button>
            <Button variant="danger" icon={<Trash2 size={18} />}>Delete</Button>
            <Button variant="outline" icon={<Plus size={18} />}>Add New</Button>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>States</h3>
          <div className={styles.buttonGroup}>
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
          </div>
        </div>
      </Card>

      {/* Inputs Section */}
      <Card title="Input Fields" subtitle="Form input components with validation">
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Basic Inputs</h3>
          <div className={styles.inputGrid}>
            <Input
              label="Username"
              placeholder="Enter username"
              icon={<User size={20} />}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="Enter email"
              icon={<Mail size={20} />}
              helperText="We'll never share your email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              icon={<Lock size={20} />}
              required
            />
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Input with Validation</h3>
          <Input
            label="Validated Input"
            value={inputValue}
            onChange={handleInputChange}
            error={inputError}
            placeholder="Type at least 3 characters"
          />
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Disabled Input</h3>
          <Input
            label="Disabled Input"
            value="Cannot edit this"
            disabled
          />
        </div>
      </Card>

      {/* Cards Section */}
      <Card title="Card Components" subtitle="Container components with various styles">
        <div className={styles.cardGrid}>
          <Card variant="default" padding="md">
            <h4>Default Card</h4>
            <p>This is a default card with medium padding.</p>
          </Card>

          <Card variant="outlined" padding="md">
            <h4>Outlined Card</h4>
            <p>This card has an outlined border style.</p>
          </Card>

          <Card variant="elevated" padding="md">
            <h4>Elevated Card</h4>
            <p>This card has an elevated shadow effect.</p>
          </Card>

          <Card 
            title="Card with Header" 
            subtitle="This card has a title and subtitle"
            actions={
              <Button size="sm" variant="outline">Action</Button>
            }
            padding="md"
          >
            <p>Card content goes here with header and actions.</p>
          </Card>

          <Card hoverable padding="md">
            <h4>Hoverable Card</h4>
            <p>Hover over this card to see the effect.</p>
          </Card>
        </div>
      </Card>

      {/* Table Section */}
      <Card title="Table Component" subtitle="Data table with custom rendering">
        <Table
          columns={tableColumns}
          data={tableData}
          onRowClick={(row) => alert(`Clicked row: ${row.name}`)}
        />
      </Card>

      {/* Modal Section */}
      <Card title="Modal Component" subtitle="Overlay dialogs with various sizes">
        <div className={styles.buttonGroup}>
          <Button onClick={() => setIsModalOpen(true)}>
            Open Modal
          </Button>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Example Modal"
          size="md"
        >
          <div className={styles.modalContent}>
            <p>This is a modal dialog with medium size.</p>
            <p>Click outside or press ESC to close.</p>
            
            <div className={styles.modalActions}>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      </Card>

      {/* Theme & Language Section */}
      <Card 
        title="Theme & Language" 
        subtitle="Toggle between light/dark mode and switch languages"
      >
        <div className={styles.section}>
          <p>Use the controls in the top-right corner to:</p>
          <ul>
            <li>Switch between light and dark themes</li>
            <li>Change language (English, Amharic, Arabic)</li>
            <li>See RTL support for Arabic</li>
          </ul>
        </div>
      </Card>

      {/* Loading Spinner Section */}
      <Card title="Loading Spinner" subtitle="Loading indicators for async operations">
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Sizes</h3>
          <div className={styles.buttonGroup}>
            <LoadingSpinner size="sm" />
            <LoadingSpinner size="md" />
            <LoadingSpinner size="lg" />
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Colors</h3>
          <div className={styles.buttonGroup}>
            <LoadingSpinner color="primary" />
            <LoadingSpinner color="secondary" />
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>With Text</h3>
          <LoadingSpinner text="Loading data..." />
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Full Screen</h3>
          <Button onClick={() => {
            setShowLoading(true);
            setTimeout(() => setShowLoading(false), 3000);
          }}>
            Show Full Screen Loading
          </Button>
          {showLoading && (
            <LoadingSpinner 
              fullScreen 
              text="Loading, please wait..." 
            />
          )}
        </div>
      </Card>

      {/* Skeleton Section */}
      <Card title="Skeleton Loaders" subtitle="Placeholder components for loading states">
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Text Skeleton</h3>
          <Button onClick={() => {
            setShowSkeleton(true);
            setTimeout(() => setShowSkeleton(false), 3000);
          }}>
            Toggle Skeleton
          </Button>
          <div style={{ marginTop: '16px' }}>
            {showSkeleton ? (
              <Skeleton variant="text" count={3} />
            ) : (
              <>
                <p>This is the actual content that loads.</p>
                <p>It replaces the skeleton when ready.</p>
                <p>Click the button to see the skeleton again.</p>
              </>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Circular Skeleton</h3>
          <Skeleton variant="circular" width="60px" height="60px" />
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Rectangular Skeleton</h3>
          <Skeleton variant="rectangular" height="200px" />
        </div>
      </Card>

      {/* Toast Section */}
      <Card title="Toast Notifications" subtitle="Temporary notification messages">
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Toast Types</h3>
          <div className={styles.buttonGroup}>
            <Button 
              variant="outline"
              onClick={() => {
                setToastType('success');
                setShowToast(true);
              }}
            >
              Success Toast
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setToastType('error');
                setShowToast(true);
              }}
            >
              Error Toast
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setToastType('warning');
                setShowToast(true);
              }}
            >
              Warning Toast
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setToastType('info');
                setShowToast(true);
              }}
            >
              Info Toast
            </Button>
          </div>
        </div>

        <Toast
          isOpen={showToast}
          onClose={() => setShowToast(false)}
          message={`This is a ${toastType} notification message!`}
          type={toastType}
          duration={5000}
          position="top-right"
        />
      </Card>

      {/* Badge Section */}
      <Card title="Badges" subtitle="Labels and status indicators">
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Variants</h3>
          <div className={styles.buttonGroup}>
            <Badge>Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Outlined</h3>
          <div className={styles.buttonGroup}>
            <Badge outline>Default</Badge>
            <Badge variant="primary" outline>Primary</Badge>
            <Badge variant="success" outline>Success</Badge>
            <Badge variant="error" outline>Error</Badge>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Sizes</h3>
          <div className={styles.buttonGroup}>
            <Badge size="sm">Small</Badge>
            <Badge size="md">Medium</Badge>
            <Badge size="lg">Large</Badge>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>With Icon</h3>
          <div className={styles.buttonGroup}>
            <Badge variant="success" icon={<CheckCircle size={14} />}>
              Verified
            </Badge>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Removable</h3>
          <div className={styles.buttonGroup}>
            <Badge 
              variant="primary" 
              onRemove={() => alert('Badge removed')}
            >
              Removable
            </Badge>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Dot Indicators</h3>
          <div className={styles.buttonGroup}>
            <Badge variant="success" dot />
            <Badge variant="error" dot />
            <Badge variant="warning" dot />
          </div>
        </div>
      </Card>

      {/* Form Components Section */}
      <Card title="Form Components" subtitle="Input controls for forms">
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Select/Dropdown</h3>
          <div className={styles.inputGrid}>
            <Select
              label="Basic Select"
              options={selectOptions}
              value={selectValue}
              onChange={setSelectValue}
              placeholder="Choose an option"
            />
            <Select
              label="Searchable Select"
              options={selectOptions}
              value={selectValue}
              onChange={setSelectValue}
              searchable
              placeholder="Search options..."
            />
            <Select
              label="Required Select"
              options={selectOptions}
              value={selectValue}
              onChange={setSelectValue}
              required
              error={!selectValue ? 'This field is required' : ''}
            />
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Checkbox</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Checkbox
              label="Accept terms and conditions"
              checked={checkboxValue}
              onChange={(e) => setCheckboxValue(e.target.checked)}
            />
            <Checkbox
              label="Small checkbox"
              size="sm"
              checked={false}
            />
            <Checkbox
              label="Large checkbox"
              size="lg"
              checked={true}
            />
            <Checkbox
              label="Disabled checkbox"
              disabled
              checked={false}
            />
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Radio Buttons</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Radio
              label="Option 1"
              name="radio-group"
              value="option1"
              checked={radioValue === 'option1'}
              onChange={(e) => setRadioValue(e.target.value)}
            />
            <Radio
              label="Option 2"
              name="radio-group"
              value="option2"
              checked={radioValue === 'option2'}
              onChange={(e) => setRadioValue(e.target.value)}
            />
            <Radio
              label="Option 3"
              name="radio-group"
              value="option3"
              checked={radioValue === 'option3'}
              onChange={(e) => setRadioValue(e.target.value)}
            />
            <Radio
              label="Disabled option"
              name="radio-group"
              value="option4"
              disabled
            />
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Textarea</h3>
          <Textarea
            label="Description"
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            placeholder="Enter your description here..."
            rows={4}
            maxLength={500}
            showCount
            helperText="Provide a detailed description"
          />
        </div>
      </Card>
    </div>
  );
};

export default ComponentShowcase;
