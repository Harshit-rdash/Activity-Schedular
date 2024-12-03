import { Schedule } from "./schedule";
import { ACTIVITY_DEPENDENCY_TYPE, ACTIVITY_STATUS } from "./enums";
import {
    get_schedule_from_task_data,
    get_task_data_from_schedule,
} from "./parser";

export interface IGanttTask {
    id: string;
    // text: string;
    start_date?: string;
    end_date?: string;
    duration?: number;
    progress?: number;
    parent?: string;
    // assignee: ICommonUserServiceResponse[];
    // organization: IUserOrgResponse[];
    actual_start_date?: string;
    actual_end_date?: string;
    projected_start_date?: string;
    projected_end_date?: string;
    // slack?: number;
    // color?: string;
    // status?: ACTIVITY_STATUS;
    // type?: "project" | "task";
    // open?: boolean;
}

export interface ITaskLink {
    // id: string;
    source: string;
    target: string;
    type: ACTIVITY_DEPENDENCY_TYPE;
    lag: number;
}

export interface ITaskData {
    data: IGanttTask[];
    links: ITaskLink[];
    root_id: string;
}

export function process_task_data(tree: ITaskData): void {
    console.log("Tree Received", tree);
    let schedule: Schedule = get_schedule_from_task_data(tree);
    console.log("Schedule Created, Processing started");
    schedule.process();
    return get_task_data_from_schedule(schedule);
}

let tree: ITaskData = {
    data: [
        {
            id: "2",
            start_date: "2024-12-01",
            end_date: "2024-12-05",
            parent: "1",
            progress: 0,
        },
        {
            id: "1",
            start_date: "2024-12-01",
            end_date: "2024-12-05",
            duration: 0,
            progress: 0,
        },
        {
            id: "3",
            start_date: "2024-12-01",
            end_date: "2024-12-05",
            duration: 5,
            parent: "1",
            progress: 0,
        },
    ],
    links: [
        {
            source: "3",
            target: "2",
            lag: 1,
            type: ACTIVITY_DEPENDENCY_TYPE.FS,
        },
    ],
    root_id: "1",
};

process_task_data(tree);
