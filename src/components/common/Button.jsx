import './Button.css';

/**
 * Reusable button component.
 *
 * @param {{
 *   children: React.ReactNode,
 *   variant?: 'primary'|'secondary'|'danger'|'ghost',
 *   size?: 'sm'|'md'|'lg',
 *   loading?: boolean,
 *   disabled?: boolean,
 *   type?: string,
 *   onClick?: Function,
 *   className?: string,
 * }} props
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...rest
}) {
  const cls = [
    'btn',
    `btn--${variant}`,
    size !== 'md' && `btn--${size}`,
    loading && 'btn--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={cls}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading && <span className="spinner spinner--sm" />}
      {children}
    </button>
  );
}
