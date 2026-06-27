import React from 'react'
import classNames from 'classnames';
import style from './Button.module.scss';

type ButtonProps = {
	children?: React.ReactNode;
	variant?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  size?: 'small' | 'medium' | 'large';
	icon?: React.ReactNode;
	disabled?: boolean;
	onClick?: () => void;
	type?: 'button' | 'submit' | 'reset';
	className?: string;
	style?: React.CSSProperties;
};



const Button = ({
	children,
	variant = 'primary',
  size = 'medium',
	icon,
	disabled = false,
	onClick,
	type = 'button',
	className,
	style: styleProp,
}: ButtonProps) => {
	return (
		<button
			className={classNames(
        style.button,
        style[variant],
        style[size],
        { [style.disabled]: disabled },
        className,
      )}
			onClick={onClick}
			disabled={disabled}
			type={type}
			style={styleProp}
		>
			{icon && <span className={style.icon}>{icon}</span>}
			{children}
		</button>
	);
}

export default Button;
