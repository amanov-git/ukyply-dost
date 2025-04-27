const Button = ({ children, size, color, className, type, ...rest }) => {
  return (
    <button
      className={`btn shadow-md border-none outline-none ${size || 'btn-md'} ${color || 'btn-primary rounded-full dark:btn-secondary'} ${className}`}
      type={type || 'button'}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button