import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// no runtime JSX import needed

export interface ItemList {
  label: string;
  action: () => void;
  icon?: React.ReactNode;
}

interface TableDropdownProps {
  items: ItemList[];
  trigger?: React.ReactNode;
}

const TableDropdown = ({ items, trigger }: TableDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((item, index) => (
          <DropdownMenuItem
            key={`i${index}`}
            className={`  cursor-pointer`}
            onClick={() => item.action()}
          >
            {item.label}
            <DropdownMenuShortcut>{item.icon}</DropdownMenuShortcut>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TableDropdown;
