import { Button } from "@/components/element/button";
import FilterItem from "@/components/element/filter/FilterItem";
import { UserSelector } from "@/components/element/selector/UserSelector";
import { SingleSelector } from "@/components/element/selector/SingleSelector";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { FaPlus } from "react-icons/fa";
import { useProject } from "@/hooks/data/use-project";
import { Project } from "@/types/project.type";
import { useAppSelector } from "@/store/hook";

interface FiltersProps {
  onAdd: () => void;
  onChange?: (filters: any) => void;
  fetch?: () => void;
}

const Filters = ({ onAdd, onChange, fetch }: FiltersProps) => {
  const { team } = useAppSelector((state) => state.selectedTeam);
  const { fetchProject } = useProject({
    initQuery: { page: 1, limit: 100, teamId: team?.id },
  });

  return (
    <div className="flex flex-row justify-between items-center">
      {/* filter */}
      <div className="flex flex-row gap-2 items-center">
        <FilterItem label="Due date" icon={<></>}>
          <DatePicker
            picker="date"
            className="w-full cursor-pointer"
            defaultValue={dayjs()}
            format="ddd DD/MM/YYYY"
            onChange={(date) => {
              if (date) {
                onChange?.({ dueDate: dayjs(date).unix() });
              } else {
                onChange?.({ dueDate: null });
              }
            }}
          />
        </FilterItem>
        <FilterItem label="Assignee" icon={<></>}>
          <UserSelector
            // multiple
            onSelect={(users) => {
              console.log(users);
              onChange?.({ assigneeId: users });
            }}
          />
        </FilterItem>
        <FilterItem label="Project" icon={<></>}>
          <div className="w-40">
            <SingleSelector<Project>
              findAll={fetchProject}
              getDisplayValue={(item) => item.name}
              onSelect={(value) => {
                onChange?.({ projectId: value });
              }}
            />
          </div>
        </FilterItem>
        <Button
          // leftIcon={<FaPlus />}
          size="sm"
          className="!rounded-xs !py-1 mr-2"
          onClick={() => {
            fetch?.();
          }}
        >
          Search
        </Button>
      </div>

      {/* actions */}
      <div className="h-full flex items-center">
        <Button
          leftIcon={<FaPlus />}
          size="sm"
          className="!rounded-xs !py-1"
          onClick={onAdd}
        >
          Add new
        </Button>
      </div>
    </div>
  );
};

export default Filters;
