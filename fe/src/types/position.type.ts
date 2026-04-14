import { LabelProps } from "./base.type";

export enum Position {
    MANAGER = 'MANAGER',
    DEV_FE = 'DEV_FE',
    DEV_BE = 'DEV_BE',
    DEV_FULLSTACK = 'DEV_FULLSTACK',
    DEV_MOBILE = 'DEV_MOBILE',
    DEV_OPS = 'DEV_OPS',
    TESTER = 'TESTER',
    DESIGNER = 'DESIGNER',
    BUSINESS_ANALYST = 'BUSINESS_ANALYST',
}


export const PositionLabels: Record<Position, LabelProps> = {
    [Position.MANAGER]: { label: "Manager", color: "text-blue-800", bgColor: "bg-blue-100" },
    [Position.DEV_FE]: { label: "Frontend Developer", color: "text-green-800", bgColor: "bg-green-100" },
    [Position.DEV_BE]: { label: "Backend Developer", color: "text-purple-800", bgColor: "bg-purple-100" },
    [Position.DEV_FULLSTACK]: { label: "Fullstack Developer", color: "text-yellow-800", bgColor: "bg-yellow-100" },
    [Position.DEV_MOBILE]: { label: "Mobile Developer", color: "text-pink-800", bgColor: "bg-pink-100" },
    [Position.DEV_OPS]: { label: "DevOps Engineer", color: "text-red-800", bgColor: "bg-red-100" },
    [Position.TESTER]: { label: "Software Tester", color: "text-indigo-800", bgColor: "bg-indigo-100" },
    [Position.DESIGNER]: { label: "UI/UX Designer", color: "text-teal-800", bgColor: "bg-teal-100" },
    [Position.BUSINESS_ANALYST]: { label: "Business Analyst", color: "text-cyan-800", bgColor: "bg-cyan-100" },
}