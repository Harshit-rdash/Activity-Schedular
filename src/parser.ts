import { Schedule } from "./schedule";
import { IDependency, Activity } from "./activity";
import { ACTIVITY_DEPENDENCY_TYPE } from "./enums";
import { format } from "date-fns";

export interface IGanttTask {
    id: string;
    start_date?: string;
    end_date?: string;
    duration?: number;
    progress?: number;
    parent?: string;
    actual_start_date?: string;
    actual_end_date?: string;
}

export interface IGanttTaskLink {
    source: string;
    target: string;
    type: ACTIVITY_DEPENDENCY_TYPE;
    lag: number;
}

export interface ITaskData {
    data: IGanttTask[];
    links: IGanttTaskLink[];
    root_id: string;
}

export function get_schedule_from_gantt_task_data(tree: ITaskData) {
    let activity_map: Map<string, Activity> = new Map<string, Activity>();
    let schedule: Schedule;
    for (let task of tree.data) {
        let activity = new Activity(
            task.id,
            task.start_date ? new Date(task.start_date) : undefined,
            task.end_date ? new Date(task.end_date) : undefined,
            task.actual_start_date
                ? new Date(task.actual_start_date)
                : undefined,
            task.actual_end_date ? new Date(task.actual_end_date) : undefined,
            [],
            [],
            task.progress ? task.progress : 0,
            task.parent
        );
        activity_map.set(task.id, activity);
    }
    for (let task of tree.data) {
        if (task.parent == undefined) {
            continue;
        }
        let activity: Activity | undefined = activity_map.get(task.parent);
        if (activity === undefined) {
            throw new Error("Parent not found");
        }
        activity.childs.push(task.id);
        activity_map.set(task.parent, activity);
    }
    for (let link in tree.links) {
        let activity: Activity | undefined = activity_map.get(
            tree.links[link].target
        );
        if (activity === undefined) {
            throw new Error("Activity not found");
        }
        let dependency: IDependency = {
            id: tree.links[link].source,
            lag: tree.links[link].lag,
            type: tree.links[link].type,
        };
        activity.dependencies.push(dependency);
    }
    schedule = new Schedule(tree.root_id, activity_map);
    return schedule;
}

export function get_gantt_task_data_from_schedule(schedule: Schedule): ITaskData {
    let data: IGanttTask[] = [];
    let links: IGanttTaskLink[] = [];
    let activity_map = schedule.get_activities();
    for (let activity of activity_map.values()) {
        let actual_start_date = activity.get_actual_start_date();
        let actual_end_date = activity.actual_end_date;
        data.push({
            id: activity.id,
            start_date: format(activity.get_planned_start_date(), "yyyy-MM-dd"),
            end_date: format(activity.get_planned_end_date(), "yyyy-MM-dd"),
            actual_start_date: actual_start_date
                ? format(actual_start_date, "yyyy-MM-dd")
                : undefined,
            actual_end_date: actual_end_date
                ? format(actual_end_date, "yyyy-MM-dd")
                : undefined,
            duration: activity.get_duration(),
            progress: activity.completion_percentage,
            parent: activity.parent_id,
        });
        for (let dependency of activity.dependencies) {
            links.push({
                source: dependency.id,
                target: activity.id,
                lag: dependency.lag,
                type: dependency.type,
            });
        }
    }
    return {
        data: data,
        links: links,
        root_id: schedule.root_id,
    };
}


