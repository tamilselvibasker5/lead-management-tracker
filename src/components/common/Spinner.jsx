import './Spinner.css';

/**
 * Loading spinner.
 * @param {{ size?: 'sm'|'md'|'lg' }} props
 */
export default function Spinner({ size = 'md' }) {
  const cls = `spinner${size !== 'md' ? ` spinner--${size}` : ''}`;
  return (
    <div className="spinner-overlay" role="status" aria-label="Loading">
      <div className={cls} />
    </div>
  );
}
