import { Schedule } from "./schedule";
import { ACTIVITY_DEPENDENCY_TYPE, ACTIVITY_STATUS } from "./enums";
import {
    ITaskData,
    Parser,
    IScheduleData,
    IActivityDependencyData,
    IActivityData,
} from "./parser";

export {
    ITaskData,
    ACTIVITY_DEPENDENCY_TYPE,
    IActivityDependencyData,
    IActivityData,
    IScheduleData,
    ACTIVITY_STATUS,
};

export class ProjectScheduleProcessor {
    public static process_project_schedule_data(
        schedule_data: IScheduleData
    ): IScheduleData {
        let schedule = Parser.get_schedule_from_schedule_data(schedule_data);
        schedule.process();
        console.log(
            "Schedule Planned Start and End Dates",
            schedule.activity_map.get(schedule.root_id)?.planned_start_date,
            schedule.activity_map.get(schedule.root_id)?.planned_end_date
        );
        console.log(
            "Schedule Projected Start and End Dates",
            schedule.activity_map.get("1")?.get_projected_start_date(),
            schedule.activity_map.get("1")?.get_projected_end_date()
        );
        console.log(
            "Schedule Actual Start and End Dates",
            schedule.activity_map.get("1")?.actual_start_date,
            schedule.activity_map.get("1")?.actual_end_date
        );
        console.log(
            "Schedule Completion and status",
            schedule.activity_map.get("1")?.completion_percentage,
            schedule.activity_map.get("1")?.get_status()
        );
        let final_schedule_data =
            Parser.get_schedule_data_from_schedule(schedule);
        return final_schedule_data;
    }
}

export class GanttTaskDataProcessor {
    public static process_gantt_task_data(tree: ITaskData): ITaskData {
        console.log("Tree Received", tree);
        let schedule: Schedule = Parser.get_schedule_from_gantt_task_data(tree);
        console.log("Schedule Created, Processing started");
        schedule.process();
        console.log(
            "Schedule Planned Start and End Dates",
            schedule.activity_map.get(schedule.root_id)?.planned_start_date,
            schedule.activity_map.get(schedule.root_id)?.planned_end_date
        );
        console.log(
            "Schedule Projected Start and End Dates",
            schedule.activity_map.get("1")?.get_projected_start_date(),
            schedule.activity_map.get("1")?.get_projected_end_date()
        );
        console.log(
            "Schedule Actual Start and End Dates",
            schedule.activity_map.get("1")?.actual_start_date,
            schedule.activity_map.get("1")?.actual_end_date
        );
        console.log(
            "Schedule Completion and status",
            schedule.activity_map.get("1")?.completion_percentage,
            schedule.activity_map.get("1")?.get_status()
        );
        let result_tree = Parser.get_gantt_task_data_from_schedule(schedule);
        console.log("Result Tree", result_tree);
        return result_tree;
    }
}

let tree: ITaskData = {
    data: [
        {
            id: "1",
            // start_date: new Date("2024-12-01"),
            // end_date: new Date("2024-12-05"),
            duration: 0,
            progress: 0,
        },
        {
            id: "2",
            start_date: new Date("2024-12-01"),
            end_date: new Date("2024-12-05"),
            actual_start_date: new Date("2024-12-01"),
            parent: "1",
            progress: 50,
        },
        {
            id: "3",
            start_date: new Date("2024-12-01"),
            end_date: new Date("2024-12-05"),
            actual_start_date: new Date("2024-12-01"),
            duration: 5,
            parent: "1",
            progress: 50,
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

GanttTaskDataProcessor.process_gantt_task_data(tree);

const project_schedule = {
    uuid: "1",
    activities: [
        {
            uuid: "1",
            dependencies: [],
        },
        {
            uuid: "2",
            parent_uuid: "1",
            planned_start_date: "2024-12-01",
            planned_end_date: "2024-12-05",
            completion_percentage: 50,
            actual_start_date: "2024-12-01",
            // actual_end_date:,
            dependencies: [
                {
                    dependency_uuid: "3",
                    lag: 1,
                    type: ACTIVITY_DEPENDENCY_TYPE.FS,
                },
            ],
        },
        {
            uuid: "3",
            parent_uuid: "1",
            planned_start_date: "2024-12-01",
            planned_end_date: "2024-12-05",
            completion_percentage: 50,
            actual_start_date: "2024-12-01",
            // actual_end_date:,
            dependencies: [],
        },
    ],
};

// ProjectScheduleProcessor.process_project_schedule_data(project_schedule);
