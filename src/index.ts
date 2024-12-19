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

// let tree: ITaskData = {
//     data: [
//         {
//             id: "1",
//             // start_date: new Date("2024-12-01"),
//             // end_date: new Date("2024-12-05"),
//             duration: 0,
//             progress: 0,
//             extra_data: "Some extra data",
//         } as IGanttTask,
//         // {
//         //     id: "2",
//         //     start_date: new Date("2024-12-01"),
//         //     end_date: new Date("2024-12-05"),
//         //     actual_start_date: new Date("2024-12-01"),
//         //     parent: "1",
//         //     progress: 50,
//         // },
//         // {
//         //     id: "3",
//         //     start_date: new Date("2024-12-01"),
//         //     end_date: new Date("2024-12-05"),
//         //     actual_start_date: new Date("2024-12-01"),
//         //     duration: 5,
//         //     parent: "1",
//         //     progress: 50,
//         // },
//     ],
//     links: [
//         // {
//         //     source: "3",
//         //     target: "2",
//         //     lag: 1,
//         //     type: ACTIVITY_DEPENDENCY_TYPE.FS,
//         // },
//     ],
//     root_id: "1",
// };

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
    uuid: "ce6075ab-e049-478f-8243-724caf978602",
    activities: [
        {
            uuid: "a620e6f5-e5ce-4fd2-af3a-a1ce8a1644d3",
            parent_uuid: "ce6075ab-e049-478f-8243-724caf978602",
            planned_start_date: "2024-12-01",
            planned_end_date: "2024-12-12",
            actual_start_date: "2024-12-01",
            completion_percentage: 80,
            dependencies: [],
        },
        {
            uuid: "03961502-8370-4272-8920-7323cbd41f66",
            parent_uuid: "ce6075ab-e049-478f-8243-724caf978602",
            planned_start_date: "2024-12-03",
            planned_end_date: "2024-12-07",
            actual_start_date: "2024-12-04",
            completion_percentage: 100,
            dependencies: [],
        },
        {
            uuid: "f550d9d0-adf5-40f2-a292-5b1732c16fab",
            parent_uuid: "a620e6f5-e5ce-4fd2-af3a-a1ce8a1644d3",
            planned_start_date: "2024-12-01",
            planned_end_date: "2024-12-04",
            actual_start_date: "2024-12-01",
            completion_percentage: 100,
            dependencies: [],
        },
        {
            uuid: "76c5e3f9-9dd5-4be9-ad23-25b87609eee1",
            parent_uuid: "a620e6f5-e5ce-4fd2-af3a-a1ce8a1644d3",
            planned_start_date: "2024-12-10",
            planned_end_date: "2024-12-12",
            actual_start_date: "2024-12-11",
            completion_percentage: 50,
            dependencies: [
                {
                    dependency_uuid: "f550d9d0-adf5-40f2-a292-5b1732c16fab",
                    lag: 0,
                    type: ACTIVITY_DEPENDENCY_TYPE.FS,
                },
                {
                    dependency_uuid: "03961502-8370-4272-8920-7323cbd41f66",
                    lag: 3,
                    type: ACTIVITY_DEPENDENCY_TYPE.FS,
                },
            ],
        },
        {
            uuid: "90a6f7cd-8089-4168-83f3-378940e09dd1",
            parent_uuid: "03961502-8370-4272-8920-7323cbd41f66",
            planned_start_date: "2024-12-03",
            planned_end_date: "2024-12-05",
            actual_start_date: "2024-12-04",
            completion_percentage: 100,
            dependencies: [],
        },
        {
            uuid: "b0a85ea6-2d05-4e6e-9dbb-a21f2989c8ae",
            parent_uuid: "03961502-8370-4272-8920-7323cbd41f66",
            planned_start_date: "2024-12-05",
            planned_end_date: "2024-12-07",
            actual_start_date: "2024-12-05",
            completion_percentage: 100,
            dependencies: [],
        },
        {
            uuid: "57fc8bb4-e7a9-42cb-99b4-a6c6bca720d9",
            parent_uuid: "03961502-8370-4272-8920-7323cbd41f66",
            planned_start_date: "2024-12-04",
            planned_end_date: "2024-12-06",
            actual_start_date: "2024-12-04",
            completion_percentage: 100,
            dependencies: [
                {
                    dependency_uuid: "90a6f7cd-8089-4168-83f3-378940e09dd1",
                    lag: 1,
                    type: ACTIVITY_DEPENDENCY_TYPE.SS,
                },
            ],
        },
        {
            uuid: "df46fd16-7a0f-4e61-878e-a2b848968ab5",
            parent_uuid: "f550d9d0-adf5-40f2-a292-5b1732c16fab",
            planned_start_date: "2024-12-01",
            planned_end_date: "2024-12-02",
            actual_start_date: "2024-12-01",
            completion_percentage: 100,
            dependencies: [],
        },
        {
            uuid: "bb8706df-1540-467c-a43b-09804545d94b",
            parent_uuid: "f550d9d0-adf5-40f2-a292-5b1732c16fab",
            planned_start_date: "2024-12-03",
            planned_end_date: "2024-12-04",
            actual_start_date: "2024-12-03",
            completion_percentage: 100,
            dependencies: [
                {
                    dependency_uuid: "df46fd16-7a0f-4e61-878e-a2b848968ab5",
                    lag: 1,
                    type: ACTIVITY_DEPENDENCY_TYPE.FS,
                },
            ],
        },
        {
            uuid: "be97f916-7fce-410b-b30b-bf6cabbdfd56",
            parent_uuid: "90a6f7cd-8089-4168-83f3-378940e09dd1",
            planned_start_date: "2024-12-03",
            planned_end_date: "2024-12-05",
            actual_start_date: "2024-12-04",
            completion_percentage: 100,
            dependencies: [
                {
                    dependency_uuid: "bb8706df-1540-467c-a43b-09804545d94b",
                    lag: 2,
                    type: ACTIVITY_DEPENDENCY_TYPE.SF,
                },
            ],
        },
        {
            uuid: "ce6075ab-e049-478f-8243-724caf978602",
            completion_percentage: 0,
            dependencies: [],
        },
    ],
};

ProjectScheduleProcessor.process_project_schedule_data(project_schedule);
