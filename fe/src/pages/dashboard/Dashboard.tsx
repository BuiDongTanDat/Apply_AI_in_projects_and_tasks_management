import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  UserCheck,
  ClipboardList,
  CheckCircle,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Mock data cho dashboard
const mockData = {
  overview: {
    totalUsers: 18,
    activeUsers: 1,
    totalTeams: 3,
    totalTasks: 56,
    completedTasks: 21,
    pendingTasks: 13,
  },

  taskProgress: [
    { month: "Jan", completed: 45, pending: 20, inProgress: 15 },
    { month: "Feb", completed: 52, pending: 18, inProgress: 22 },
    { month: "Mar", completed: 48, pending: 25, inProgress: 18 },
    { month: "Apr", completed: 61, pending: 15, inProgress: 24 },
    { month: "May", completed: 55, pending: 22, inProgress: 28 },
    { month: "Jun", completed: 67, pending: 12, inProgress: 21 },
  ],

  teamPerformance: [
    { team: "Development", tasks: 85, completed: 72 },
    { team: "Design", tasks: 45, completed: 38 },
    { team: "Marketing", tasks: 32, completed: 28 },
    { team: "Sales", tasks: 28, completed: 25 },
    { team: "Support", tasks: 38, completed: 35 },
  ],

  userDistribution: [
    { name: "Active", value: 892, color: "#10b981" },
    { name: "Inactive", value: 245, color: "#f59e0b" },
    { name: "Pending", value: 110, color: "#ef4444" },
  ],

  recentActivities: [
    {
      id: 1,
      user: "Doc Ngam",
      action: "completed task",
      target: "CI/CD check failed",
      time: "2 hours ago",
      type: "task",
    },
    {
      id: 2,
      user: "Doc Ngam",
      action: "joined team",
      target: "First team 2",
      time: "6 days ago",
      type: "team",
    },
    {
      id: 3,
      user: "Doc Ngam",
      action: "created new task",
      target: "re-deploy to Digital Ocean",
      time: "1 hour ago",
      type: "task",
    },
    {
      id: 4,
      user: "Doc Ngam",
      action: "updated profile",
      target: "",
      time: "2 hours ago",
      type: "user",
    },
    {
      id: 5,
      user: "Alex Johnson",
      action: "completed project",
      target: "Mobile App V2",
      time: "3 hours ago",
      type: "task",
    },
  ],
};

const Dashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! $</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockData.overview.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs opacity-90">
              <span className="text-green-200">+12% </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              Active Users
            </CardTitle>
            <UserCheck className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockData.overview.activeUsers.toLocaleString()}
            </div>
            <p className="text-xs opacity-90">
              <span className="text-green-200">+8% </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              Total Tasks
            </CardTitle>
            <ClipboardList className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockData.overview.totalTasks.toLocaleString()}
            </div>
            <p className="text-xs opacity-90">
              <span className="text-green-200">+23% </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              Completed Tasks
            </CardTitle>
            <CheckCircle className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockData.overview.completedTasks.toLocaleString()}
            </div>
            <p className="text-xs opacity-90">
              <span className="text-green-200">+18% </span>
              from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Task Progress Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockData.taskProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Completed"
                />
                <Line
                  type="monotone"
                  dataKey="inProgress"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="In Progress"
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Pending"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Team Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              Team Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockData.teamPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="team" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="tasks" fill="#e5e7eb" name="Total Tasks" />
                <Bar
                  dataKey="completed"
                  fill="#10b981"
                  name="Completed Tasks"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-green-500" />
              User Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={mockData.userDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                >
                  {mockData.userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === "task"
                        ? "bg-blue-500"
                        : activity.type === "team"
                        ? "bg-purple-500"
                        : "bg-green-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span>{" "}
                      {activity.action}
                      {activity.target && (
                        <span className="font-medium text-blue-600">
                          {" "}
                          {activity.target}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500 rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Team Efficiency
                </p>
                <p className="text-2xl font-bold text-gray-900">87%</p>
                <p className="text-xs text-green-600">+5% from last week</p>
              </div>
              <div className="text-blue-500">
                <Users className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Task Completion Rate
                </p>
                <p className="text-2xl font-bold text-gray-900">94%</p>
                <p className="text-xs text-green-600">+2% from last week</p>
              </div>
              <div className="text-green-500">
                <CheckCircle className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Teams
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockData.overview.totalTeams}
                </p>
                <p className="text-xs text-green-600">+3 new teams</p>
              </div>
              <div className="text-purple-500">
                <UserCheck className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
