import './Dropdown.css';

/**
 * Controlled select-style dropdown.
 *
 * @param {{
 *   value: string,
 *   onChange: (value: string) => void,
 *   options: { value: string, label: string }[],
 *   id?: string,
 *   className?: string,
 *   disabled?: boolean,
 * }} props
 */
export default function Dropdown({
  value,
  onChange,
  options,
  id,
  className = '',
  disabled = false,
}) {
  return (
    <div className={`dropdown ${className}`}>
      <select
        id={id}
        className="dropdown__select"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
