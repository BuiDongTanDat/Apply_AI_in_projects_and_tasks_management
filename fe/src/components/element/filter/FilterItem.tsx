export interface FilterItemProps {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const FilterItem = (props: FilterItemProps) => {
  const { label, icon, children, className } = props;
  return (
    <div
      className={`flex items-center shadow-sm p-1 rounded-md hover:bg-gray-100 ${className} w-fit`}
    >
      <div className="mr-1">{icon}</div>
      <div className=" text-sm italic text-gray-500">{label}</div>
      <div className="ml-1">{children}</div>
    </div>
  );
};

export default FilterItem;
