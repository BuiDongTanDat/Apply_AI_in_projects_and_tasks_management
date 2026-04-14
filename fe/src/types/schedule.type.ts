export interface Schedule {
    id: number
    name: string
    description?: string
    startDate: number
    endDate: number
    status: ScheduleStatus
    color: string
    projectId: number
    sortOrder: number
    progress: number
    taskCount: number
    completedTaskCount: number
}

export enum ScheduleStatus {
    PLANNED = 'PLANNED',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    ON_HOLD = 'ON_HOLD'
}