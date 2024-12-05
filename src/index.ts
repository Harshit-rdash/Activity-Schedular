import { Schedule } from "./schedule";
import { ACTIVITY_DEPENDENCY_TYPE } from "./enums";
import {
    get_schedule_from_gantt_task_data,
    get_gantt_task_data_from_schedule,
    ITaskData,
} from "./parser";

export function process_gantt_task_data(tree: ITaskData): ITaskData {
    console.log("Tree Received", tree);
    let schedule: Schedule = get_schedule_from_gantt_task_data(tree);
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
    let result_tree = get_gantt_task_data_from_schedule(schedule);
    console.log("Result Tree", result_tree);
    return result_tree;
}

let tree: ITaskData = {
    data: [
        {
            id: "1",
            // start_date: "2024-12-01",
            // end_date: "2024-12-05",
            duration: 0,
            progress: 0,
        },
        {
            id: "2",
            start_date: "2024-12-01",
            end_date: "2024-12-05",
            // actual_start_date: "2024-12-01",
            parent: "1",
            // progress: 50,
        },
        {
            id: "3",
            start_date: "2024-12-01",
            end_date: "2024-12-05",
            actual_start_date: "2024-12-01",
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

process_gantt_task_data(tree);
