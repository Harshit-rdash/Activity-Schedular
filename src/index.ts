import { Schedule } from "./schedule";
import { DependencyTypeEnum, ActivityStatusEnum } from "./enums";
import { IDependency, Activity } from "./activity";

export interface ITask {
    id: string;
    start_date: string; // actual start date
    end_date: string; // actual end date
    duration: number;
    actual_start_date?: string | null;
    actual_end_date?: string | null;
    projected_start_date: string | null;
    projected_end_date: string | null;
    parent: string;
    status?: ActivityStatusEnum | null;
    completion_percentage: number;
}

export interface ILink {
    source: string;
    target: string;
    lag: number;
    type: DependencyTypeEnum;
}

export interface ITree {
    tasks: ITask[];
    links: ILink[];
    root_id: string;
}

export function get_schedule_from_tree(tree: ITree) {
    let activity_map: Map<string, Activity> = new Map<string, Activity>();
    let schedule: Schedule;
    let root_activity = new Activity(
        tree.root_id,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        [],
        [],
        0
    );
    activity_map.set(tree.root_id, root_activity);
    for (let task of tree.tasks) {
        let activity = new Activity(
            task.id,
            new Date(task.start_date),
            new Date(task.end_date),
            task.actual_start_date ? new Date(task.actual_start_date) : null,
            task.actual_end_date ? new Date(task.actual_end_date) : null,
            task.projected_start_date
                ? new Date(task.projected_start_date)
                : null,
            task.projected_end_date ? new Date(task.projected_end_date) : null,
            task.status as any, // Assuming ActivityStatusEnum is imported correctly
            task.duration,
            [],
            [],
            task.completion_percentage
        );
        activity_map.set(task.id, activity);
    }
    for (let task of tree.tasks) {
        let activity: Activity | undefined = activity_map.get(task.parent);
        if (activity === undefined) {
            throw new Error("Parent not found");
        }
        activity.childs.push(task.id);
        activity_map.set(task.parent, activity);
    }
    for (let link in tree.links) {
        let activity: Activity | undefined = activity_map.get(
            tree.links[link].source
        );
        if (!activity) {
            throw new Error("Activity not found");
        }
        let dependency: IDependency = {
            id: tree.links[link].target,
            lag: tree.links[link].lag,
            type: tree.links[link].type,
        };
        activity.dependencies.push(dependency);
    }
    schedule = new Schedule(tree.root_id, activity_map);
    return schedule;
}

function process_start() {
    let tree: ITree = {
        tasks: [
            {
                id: "2",
                start_date: "2024-12-01",
                end_date: "2024-12-05",
                duration: 5,
                actual_start_date: null,
                actual_end_date: null,
                projected_start_date: null,
                projected_end_date: null,
                parent: "1",
                status: null,
                completion_percentage: 0,
            },
            {
                id: "3",
                start_date: "2024-12-01",
                end_date: "2024-12-05",
                duration: 5,
                actual_start_date: null,
                actual_end_date: null,
                projected_start_date: null,
                projected_end_date: null,
                parent: "1",
                status: null,
                completion_percentage: 0,
            },
        ],
        links: [
            {
                source: "1",
                target: "2",
                lag: 1,
                type: DependencyTypeEnum.FS,
            },
            {
                source: "1",
                target: "3",
                lag: 2,
                type: DependencyTypeEnum.FS,
            },
        ],
        root_id: "1",
    };
    console.log("starting node", (tree = tree));
    let schedule: Schedule = get_schedule_from_tree(tree);
    console.log("Schedule Created", schedule);
    


}

process_start();
