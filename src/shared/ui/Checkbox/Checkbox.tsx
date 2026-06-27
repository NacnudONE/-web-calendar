import React from 'react'
import styles from './Checkbox.module.scss';
import classNames from 'classnames';

type CheckboxProps = {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
};

const Checkbox = ({
  checked,
  onChange,
  label,
  disabled = false,
  className,
}: CheckboxProps) => (
  <label className={classNames(styles.wrapper, className)}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={styles.checkbox}
    />
    {label && <span className={styles.label}>{label}</span>}
  </label>
);

export default Checkbox;
