import { Schedule } from "./schedule";
import { ACTIVITY_DEPENDENCY_TYPE, ACTIVITY_STATUS } from "./enums";
import {
    ITaskData,
    ScheduleDataParser,
    IScheduleData,
    IActivityDependencyData,
    IActivityData,
    GanttDataParser,
    IGanttTask,
} from "./parser";

export {
    ITaskData,
    ACTIVITY_DEPENDENCY_TYPE,
    IActivityDependencyData,
    IActivityData,
    IScheduleData,
    ACTIVITY_STATUS,
};

export class GanttTaskDataProcessor {
    public static process_gantt_task_data(tree: ITaskData): ITaskData {
        console.log("Tree Received", tree);
        if (tree.data.length <= 1) {
            console.log("No sufficient data to process");
            return tree;
        }
        const parser = new GanttDataParser();
        let schedule: Schedule = parser.get_schedule_from_gantt_task_data(tree);
        console.log("Schedule Created, Processing started");
        schedule.process();
        console.log(
            "Schedule Planned Start and End Dates",
            schedule.activity_map.get(schedule.root_id)?.planned_start_date,
            schedule.activity_map.get(schedule.root_id)?.planned_end_date
        );
        console.log(
            "Schedule Projected Start and End Dates",
            schedule.activity_map
                .get(schedule.root_id)
                ?.get_projected_start_date(),
            schedule.activity_map
                .get(schedule.root_id)
                ?.get_projected_end_date()
        );
        console.log(
            "Schedule Actual Start and End Dates",
            schedule.activity_map.get(schedule.root_id)?.actual_start_date,
            schedule.activity_map.get(schedule.root_id)?.actual_end_date
        );
        console.log(
            "Schedule Completion and status",
            schedule.activity_map.get(schedule.root_id)?.completion_percentage,
            schedule.activity_map.get(schedule.root_id)?.get_status()
        );
        let result_tree = parser.get_gantt_task_data_from_schedule(schedule);
        console.log("Result Tree", result_tree);
        return result_tree;
    }

    public static detect_cycle(tree: ITaskData): boolean {
        console.log("Tree Received", tree);
        if (tree.data.length <= 1) {
            console.log("No sufficient data to process");
            return false;
        }
        const parser = new GanttDataParser();
        let schedule: Schedule = parser.get_schedule_from_gantt_task_data(tree);
        console.log("Schedule Created, Cycle detection started");
        let has_cycle = schedule.detect_cycle();
        console.log("Cycle Detected: ", has_cycle);
        return has_cycle;
    }
}

const tree = {
    root_id: "0",
    data: [
        {
            id: "0",
        },
        {
            id: "1",
            text: "A",
            start_date: new Date("2025-01-15T18:30:00.000Z"),
            end_date: new Date("2025-01-16T18:30:00.000Z"),
            duration: 1,
            progress: 0,
            assignees: [],
            organizations: [],
            projected_start_date: new Date("2025-01-14T18:30:00.000Z"),
            projected_end_date: new Date("2025-01-14T18:30:00.000Z"),
            slack: 0,
            color: "#9689B2",
            status: "ON_TIME",
            type: "task",
            open: false,
            wbs: "1",
            editField: null,
            isCritical: true,
            attachments: [],
            delay_by: 0,
            selected: false,
            dependencies: [],
        },
        {
            id: "2",
            text: "B",
            start_date: new Date("2025-01-16T18:30:00.000Z"),
            end_date: new Date("2025-01-17T18:30:00.000Z"),
            duration: 1,
            progress: 0,
            assignees: [],
            organizations: [],
            projected_start_date: new Date("2025-01-15T18:30:00.000Z"),
            projected_end_date: new Date("2025-01-15T18:30:00.000Z"),
            slack: 0,
            color: "#9689B2",
            status: "ON_TIME",
            type: "task",
            open: false,
            wbs: "2",
            editField: null,
            prevSibling: "1",
            isCritical: true,
            attachments: [],
            delay_by: 0,
            selected: false,
            dependencies: [],
        },
        {
            id: "3",
            text: "C",
            start_date: new Date("2025-01-15T18:30:00.000Z"),
            end_date: new Date("2025-01-16T18:30:00.000Z"),
            duration: 1,
            progress: 0,
            assignees: [],
            organizations: [],
            projected_start_date: new Date("2025-01-14T18:30:00.000Z"),
            projected_end_date: new Date("2025-01-14T18:30:00.000Z"),
            slack: 1,
            color: "#9689B2",
            status: "ON_TIME",
            type: "task",
            open: false,
            wbs: "3",
            editField: null,
            prevSibling: "2",
            isCritical: false,
            attachments: [],
            delay_by: 0,
            selected: false,
            dependencies: [],
        },
    ],
    links: [
        {
            source: "1",
            lag: 0,
            target: "2",
            type: ACTIVITY_DEPENDENCY_TYPE.FS,
        },
    ],
};
// GanttTaskDataProcessor.process_gantt_task_data(tree);

const tree_have_cycle = {
    root_id: "0",
    data: [
        {
            id: "0",
        },
        {
            id: "1",
            parent: "0",
        },
        {
            id: "2",
            parent: "0",
        },
        {
            id: "3",
            parent: "1",
        },
        {
            id: "4",
            parent: "1",
        },
    ],
    links: [
        {
            source: "3",
            target: "4",
            type: ACTIVITY_DEPENDENCY_TYPE.FS,
            lag: 0,
        },
        {
            source: "2",
            target: "4",
            type: ACTIVITY_DEPENDENCY_TYPE.FS,
            lag: 0,
        },
        {
            source: "1",
            target: "2",
            type: ACTIVITY_DEPENDENCY_TYPE.FS,
            lag: 0,
        },
    ],
};

// GanttTaskDataProcessor.detect_cycle(tree_have_cycle);

export class ProjectScheduleProcessor {
    public static process_project_schedule_data(
        schedule_data: IScheduleData
    ): IScheduleData {
        if (schedule_data.activities.length <= 1) {
            console.log("No sufficient data to process");
            return schedule_data;
        }
        const parser = new ScheduleDataParser();
        let schedule = parser.get_schedule_from_schedule_data(schedule_data);
        schedule.process();
        console.log(
            "Schedule Planned Start and End Dates",
            schedule.activity_map.get(schedule.root_id)?.planned_start_date,
            schedule.activity_map.get(schedule.root_id)?.planned_end_date
        );
        console.log(
            "Schedule Projected Start and End Dates",
            schedule.activity_map
                .get(schedule.root_id)
                ?.get_projected_start_date(),
            schedule.activity_map
                .get(schedule.root_id)
                ?.get_projected_end_date()
        );
        console.log(
            "Schedule Actual Start and End Dates",
            schedule.activity_map.get(schedule.root_id)?.actual_start_date,
            schedule.activity_map.get(schedule.root_id)?.actual_end_date
        );
        console.log(
            `Schedule Completion ${
                schedule.activity_map.get(schedule.root_id)
                    ?.completion_percentage
            }, status ${schedule.activity_map
                .get(schedule.root_id)
                ?.get_status()},
            by ${schedule.activity_map.get(schedule.root_id)?.get_delayed_by()}
            `
        );
        let final_schedule_data =
            parser.get_schedule_data_from_schedule(schedule);
        return final_schedule_data;
    }
}

const project_schedule = {
    uuid: "0",
    activities: [
        {
            uuid: "1",
            parent_uuid: "0",
            planned_start_date: "2024-12-01",
            planned_end_date: "2024-12-12",
            // actual_start_date: "2024-12-01",
            completion_percentage: 0,
            dependencies: [],
        },
        {
            uuid: "2",
            parent_uuid: "0",
            planned_start_date: "2024-12-03",
            planned_end_date: "2024-12-07",
            actual_start_date: "2024-12-04",
            completion_percentage: 100,
            dependencies: [],
        },
        {
            uuid: "3",
            parent_uuid: "1",
            planned_start_date: "2024-12-01",
            planned_end_date: "2024-12-04",
            actual_start_date: "2024-12-01",
            completion_percentage: 10,
            dependencies: [],
        },
        {
            uuid: "4",
            parent_uuid: "1",
            planned_start_date: "2024-12-10",
            planned_end_date: "2024-12-12",
            actual_start_date: "2024-12-11",
            completion_percentage: 50,
            dependencies: [
                {
                    dependency_uuid: "3",
                    lag: 0,
                    type: ACTIVITY_DEPENDENCY_TYPE.FS,
                },
                {
                    dependency_uuid: "2",
                    lag: 3,
                    type: ACTIVITY_DEPENDENCY_TYPE.FS,
                },
            ],
        },
        {
            uuid: "5",
            parent_uuid: "2",
            planned_start_date: "2024-12-03",
            planned_end_date: "2024-12-05",
            actual_start_date: "2024-12-04",
            completion_percentage: 100,
            dependencies: [],
        },
        {
            uuid: "6",
            parent_uuid: "2",
            planned_start_date: "2024-12-05",
            planned_end_date: "2024-12-07",
            actual_start_date: "2024-12-05",
            completion_percentage: 100,
            dependencies: [],
        },
        {
            uuid: "7",
            parent_uuid: "2",
            planned_start_date: "2024-12-04",
            planned_end_date: "2024-12-06",
            actual_start_date: "2024-12-04",
            completion_percentage: 100,
            dependencies: [
                {
                    dependency_uuid: "5",
                    lag: 1,
                    type: "SS",
                },
            ],
        },
        {
            uuid: "8",
            parent_uuid: "3",
            planned_start_date: "2024-12-01",
            planned_end_date: "2024-12-02",
            actual_start_date: "2024-12-01",
            completion_percentage: 10,
            dependencies: [],
        },
        {
            uuid: "9",
            parent_uuid: "3",
            planned_start_date: "2024-12-03",
            planned_end_date: "2024-12-04",
            actual_start_date: "2024-12-03",
            actual_end_date: "2024-12-04",
            completion_percentage: 100,
            dependencies: [
                {
                    dependency_uuid: "8",
                    lag: 1,
                    type: ACTIVITY_DEPENDENCY_TYPE.FS,
                },
            ],
        },
        {
            uuid: "10",
            parent_uuid: "5",
            planned_start_date: "2024-12-03",
            planned_end_date: "2024-12-05",
            actual_start_date: "2024-12-04",
            completion_percentage: 40,
            dependencies: [
                {
                    dependency_uuid: "9",
                    lag: 2,
                    type: "SF",
                },
            ],
        },
        {
            uuid: "0",
            completion_percentage: 0,
            dependencies: [],
        },
    ],
};


// ProjectScheduleProcessor.process_project_schedule_data(project_schedule);
