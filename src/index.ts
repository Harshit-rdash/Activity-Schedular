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
}

const tree = {
    root_id: "0",
    data: [
        {
            id: "0",
        },
        {
            id: "activity-1",
            text: "Activity 1",
            progress: 0,
            assignees: [],
            organizations: [],
            slack: 0,
            color: "#FF0000",
            type: "task",
            open: true,
            wbs: "1",
            readonly: false,
            edit_field: null,
            commentCount: 0,
            attachments: [],
        },
        {
            id: "activity-2",
            text: "Activity 2",
            start_date: new Date("2021-09-01T00:00:00.000Z"),
            end_date: new Date("2021-09-10T00:00:00.000Z"),
            duration: 10,
            progress: 0,
            parent: "activity-1",
            assignees: [],
            organizations: [],
            projected_start_date: new Date("2021-09-01T00:00:00.000Z"),
            projected_end_date: new Date("2021-09-10T00:00:00.000Z"),
            slack: 0,
            color: "#FF0000",
            type: "task",
            open: true,
            wbs: "1",
            readonly: false,
            edit_field: null,
            commentCount: 0,
            attachments: [],
        },
    ],
    links: [],
};

// GanttTaskDataProcessor.process_gantt_task_data(tree);

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
            "Schedule Completion and status",
            schedule.activity_map.get(schedule.root_id)?.completion_percentage,
            schedule.activity_map.get(schedule.root_id)?.get_status()
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
            actual_start_date: "2024-12-01",
            completion_percentage: 80,
            dependencies: [],
        },
        {
            uuid: "2",
            parent_uuid: "0",
            planned_start_date: "2024-12-03",
            planned_end_date: "2024-12-07",
            actual_start_date: "2024-12-04",
            completion_percentage: 20,
            dependencies: [],
        },
        {
            uuid: "3",
            parent_uuid: "1",
            planned_start_date: "2024-12-01",
            planned_end_date: "2024-12-04",
            actual_start_date: "2024-12-01",
            completion_percentage: 90,
            dependencies: [],
        },
        {
            uuid: "4",
            parent_uuid: "1",
            planned_start_date: "2024-12-10",
            planned_end_date: "2024-12-12",
            actual_start_date: "2024-12-11",
            completion_percentage: 10,
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
            completion_percentage: 60,
            dependencies: [],
        },
        {
            uuid: "6",
            parent_uuid: "2",
            planned_start_date: "2024-12-05",
            planned_end_date: "2024-12-07",
            actual_start_date: "2024-12-05",
            completion_percentage: 20,
            dependencies: [],
        },
        {
            uuid: "7",
            parent_uuid: "2",
            planned_start_date: "2024-12-04",
            planned_end_date: "2024-12-06",
            actual_start_date: "2024-12-04",
            completion_percentage: 80,
            dependencies: [
                {
                    dependency_uuid: "5",
                    lag: 1,
                    type: ACTIVITY_DEPENDENCY_TYPE.SS,
                },
            ],
        },
        {
            uuid: "8",
            parent_uuid: "3",
            planned_start_date: "2024-12-01",
            planned_end_date: "2024-12-02",
            actual_start_date: "2024-12-01",
            completion_percentage: 50,
            dependencies: [],
        },
        {
            uuid: "9",
            parent_uuid: "3",
            planned_start_date: "2024-12-03",
            planned_end_date: "2024-12-04",
            actual_start_date: "2024-12-03",
            actual_end_date: "2024-12-05",
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
            completion_percentage: 10,
            dependencies: [
                {
                    dependency_uuid: "9",
                    lag: 2,
                    type: ACTIVITY_DEPENDENCY_TYPE.SF,
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
