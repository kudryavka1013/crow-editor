import { forwardRef } from "react";
import classnames from "classnames";
import "./select.scss";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={classnames("crow-select", className)}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";

export default Select;
