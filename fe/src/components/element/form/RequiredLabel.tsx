import { cx } from "class-variance-authority";

const RequiredLabel = ({
  children,
  required,
  className,
}: {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) => (
  <span
    className={cx(
      "flex items-center text-xs font-medium text-gray-700",
      className
    )}
  >
    {children}
    {required && <span className="ml-0.5 text-red-500">*</span>}
  </span>
);
export default RequiredLabel;
