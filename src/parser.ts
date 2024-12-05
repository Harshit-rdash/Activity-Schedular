import { Schedule } from "./schedule";
import { IDependency, Activity } from "./activity";
import { ITaskData } from ".";

export function get_schedule_from_task_data(tree: ITaskData) {
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
            task.progress ? task.progress : 0
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

export function get_task_data_from_schedule(schedule: Schedule) {}
