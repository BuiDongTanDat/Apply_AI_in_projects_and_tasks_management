import { message, Pagination, Popconfirm, Table } from "antd";
import { useEffect, useRef, useState } from "react";
import { ProjectModal } from "./components/ProjectModal";
import { ProjectReports } from "./components/ProjectReports";
import { SuggestedTasksSection } from "./components/SuggestedTasksSection";
import { useProject } from "@/hooks/data/use-project";
import "./style/projectPage.scss";
import { Button } from "@/components/element/button";
import { Button as AntBtn } from "antd";
import { Project } from "@/types/project.type";
import { Task } from "@/types/task.type";
import { DeleteIcon, EditIcon } from "lucide-react";
import { projectApi } from "@/api/project.api";
import { taskApi } from "@/api/task.api";
import { useAppSelector } from "@/store/hook";
import { useNavigate } from "react-router";

const { Column } = Table;

export const ProjectPage = () => {
  const { team } = useAppSelector((state) => state.selectedTeam);
  const navigate = useNavigate();

  const {
    projects,
    totalProject,
    fetchProject,
    loadingProject,
    setQueryProject,
    queryProject,
  } = useProject({ initQuery: { page: 1, limit: 10, teamId: team?.id } });
  const modalRef = useRef<ProjectModal>(null);

  const [suggestedTasks, setSuggestedTasks] = useState<Task[]>([]);
  const [loadingSuggestedTasks, setLoadingSuggestedTasks] = useState(false);

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryProject]);




  const handleDeleteProject = async (projectId: number) => {
    try {
      await projectApi.deleteProject(projectId);
      message.success("Delete Project successfully!");
      fetchProject();
    } catch (error) {
      message.error("Failed to delete Project.");
      console.error(error);
    }
  };

  return (
    <div className="project-page">

      <ProjectReports projects={projects} />

      <div className="filter-container">
        <div className="filter-item btn">
          <Button
            onClick={() => {
              modalRef.current?.handleCreate();
            }}
            type="button"
          >
            Add project
          </Button>
        </div>
      </div>

      <div className="table-container">
        <Table
          loading={loadingProject}
          pagination={false}
          rowKey="id"
          dataSource={projects}
        >
          <Column title="ID" dataIndex="id" key="id" />
          <Column
            title="Name"
            dataIndex="name"
            key="name"
            render={(name: string, record: Project) => (
              <a
                onClick={() => navigate(`/project/${record.id}`)}
                style={{ color: "#2563eb", cursor: "pointer", fontWeight: 500 }}
              >
                {name}
              </a>
            )}
          />
          <Column
            title="Description"
            dataIndex="description"
            key="description"
          />
          <Column
            title=""
            key="actions"
            render={(_, record: Project) => {
              return (
                <>
                  <AntBtn
                    type="link"
                    onClick={() => {
                      modalRef.current?.handleUpdate(record);
                    }}
                    icon={<EditIcon size={18} />}
                  >
                    Edit
                  </AntBtn>
                  <Popconfirm
                    title="Are you sure you want to delete?"
                    okText="Delete"
                    cancelText="Cancel"
                    onConfirm={() => {
                      handleDeleteProject(record.id);
                    }}
                  >
                    <AntBtn type="link" danger icon={<DeleteIcon size={18} />}>
                      Delete
                    </AntBtn>
                  </Popconfirm>
                </>
              );
            }}
          />
        </Table>

        <Pagination
          total={totalProject}
          current={queryProject.page}
          pageSize={queryProject.limit}
          onChange={(page, pageSize) => {
            setQueryProject({ ...queryProject, page, limit: pageSize });
          }}
          style={{ marginTop: 16, float: "right" }}
        />
      </div>

      <ProjectModal
        onSubmitOk={fetchProject}
        onClose={() => {}}
        ref={modalRef}
      />
    </div>
  );
};
