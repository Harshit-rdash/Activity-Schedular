import { Schedule } from "./schedule";
import { IDependency, Activity } from "./activity";
import { ACTIVITY_DEPENDENCY_TYPE } from "./enums";
import { format, add } from "date-fns";

export interface IGanttTask {
    id: string;
    start_date?: Date;
    end_date?: Date;
    duration?: number;
    progress?: number;
    parent?: string;
    actual_start_date?: Date;
    actual_end_date?: Date;
    projected_start_date?: Date;
    projected_end_date?: Date;
    status?: string;
    delay_by?: number;
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

export interface IActivityDependencyData {
    dependency_uuid: string;
    lag: number;
    type: string;
}

export interface IActivityData {
    uuid: string;
    parent_uuid?: string;
    planned_start_date?: string;
    planned_end_date?: string;
    duration?: number;
    completion_percentage?: number;
    actual_start_date?: string;
    actual_end_date?: string;
    dependencies: IActivityDependencyData[];
    projected_start_date?: string;
    projected_end_date?: string;
    status?: string;
    delay_by?: number;
}

export interface IScheduleData {
    uuid: string;
    activities: IActivityData[];
}

export class GanttDataParser {
    extra_data_map: Map<string, IGanttTask> = new Map();

    public get_schedule_from_gantt_task_data(tree: ITaskData): Schedule {
        let activity_map: Map<string, Activity> = new Map<string, Activity>();
        for (let task of tree.data) {
            let activity = new Activity(
                task.id,
                task.start_date ? task.start_date : undefined,
                task.end_date ? add(task.end_date, { days: -1 }) : undefined,
                task.actual_start_date ? task.actual_start_date : undefined,
                task.actual_end_date ? task.actual_end_date : undefined,
                [],
                [],
                task.progress ? task.progress * 100 : 0,
                task.parent
                    ? task.parent
                    : task.id == tree.root_id
                    ? undefined
                    : tree.root_id
            );
            activity_map.set(task.id, activity);
            this.extra_data_map.set(task.id, task);
        }
        for (let task of tree.data) {
            const activity = activity_map.get(task.id);
            if (!activity || !activity.parent_id) {
                continue;
            }
            let parent_activity = activity_map.get(activity?.parent_id);
            if (parent_activity === undefined) {
                throw new Error("Parent not found");
            }
            parent_activity.childs.push(task.id);
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
        let schedule = new Schedule(tree.root_id, activity_map);
        return schedule;
    }
    public get_gantt_task_data_from_schedule(schedule: Schedule): ITaskData {
        let data: IGanttTask[] = [];
        let links: IGanttTaskLink[] = [];
        let activity_map = schedule.get_activities();
        for (let activity of activity_map.values()) {
            let actual_start_date = activity.get_actual_start_date();
            let actual_end_date = activity.actual_end_date;
            let parent_id = activity.get_parent_id();
            const root = schedule.get_root();
            if (parent_id == root && activity.id !== root) {
                parent_id = undefined;
            }
            data.push({
                ...this.extra_data_map.get(activity.id),
                id: activity.id,
                start_date: activity.get_planned_start_date(),
                end_date: add(activity.get_planned_end_date(), { days: 1 }),
                actual_start_date: actual_start_date
                    ? actual_start_date
                    : undefined,
                actual_end_date: actual_end_date ? actual_end_date : undefined,
                duration: activity.get_duration(),
                progress: activity.completion_percentage / 100,
                parent: parent_id,
                projected_start_date: activity.get_projected_start_date(),
                projected_end_date: activity.get_projected_end_date(),
                status: activity.get_status(),
                delay_by: activity.get_delayed_by(),
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
}
export class ScheduleDataParser {
    extra_data_map: Map<string, IActivityData> = new Map();

    private get_type_enum(type: string): ACTIVITY_DEPENDENCY_TYPE {
        if (type === "FS") {
            return ACTIVITY_DEPENDENCY_TYPE.FS;
        } else if (type === "FF") {
            return ACTIVITY_DEPENDENCY_TYPE.FF;
        } else if (type === "SF") {
            return ACTIVITY_DEPENDENCY_TYPE.SF;
        } else if (type === "SS") {
            return ACTIVITY_DEPENDENCY_TYPE.SS;
        }
        throw new Error("Invalid dependency type");
    }

    private get_type_string(type: ACTIVITY_DEPENDENCY_TYPE): string {
        if (type === ACTIVITY_DEPENDENCY_TYPE.FS) {
            return "FS";
        } else if (type === ACTIVITY_DEPENDENCY_TYPE.FF) {
            return "FF";
        } else if (type === ACTIVITY_DEPENDENCY_TYPE.SF) {
            return "SF";
        } else if (type === ACTIVITY_DEPENDENCY_TYPE.SS) {
            return "SS";
        }
        throw new Error("Invalid dependency type");
    }

    public get_schedule_from_schedule_data(
        schedule_data: IScheduleData
    ): Schedule {
        let activity_map: Map<string, Activity> = new Map<string, Activity>();
        for (let activity_data of schedule_data.activities) {
            let dependencies: IDependency[] = [];
            for (let dependency of activity_data.dependencies) {
                dependencies.push({
                    id: dependency.dependency_uuid,
                    lag: dependency.lag,
                    type: this.get_type_enum(dependency.type),
                });
            }
            let activity = new Activity(
                activity_data.uuid,
                activity_data.planned_start_date
                    ? new Date(activity_data.planned_start_date)
                    : undefined,
                activity_data.planned_end_date
                    ? new Date(activity_data.planned_end_date)
                    : undefined,
                activity_data.actual_start_date
                    ? new Date(activity_data.actual_start_date)
                    : undefined,
                activity_data.actual_end_date
                    ? new Date(activity_data.actual_end_date)
                    : undefined,
                [],
                dependencies,
                activity_data.completion_percentage
                    ? activity_data.completion_percentage
                    : 0,
                activity_data.parent_uuid
            );
            activity_map.set(activity_data.uuid, activity);
            this.extra_data_map.set(activity_data.uuid, activity_data);
        }
        for (let activity_data of schedule_data.activities) {
            if (activity_data.parent_uuid == undefined) {
                continue;
            }
            let parent_activity: Activity | undefined = activity_map.get(
                activity_data.parent_uuid
            );
            if (parent_activity === undefined) {
                console.log(activity_data.parent_uuid);
                throw new Error("Parent not found");
            }
            parent_activity.childs.push(activity_data.uuid);
        }
        let schedule = new Schedule(schedule_data.uuid, activity_map);
        return schedule;
    }

    public get_schedule_data_from_schedule(schedule: Schedule): IScheduleData {
        let activities: IActivityData[] = [];
        let activity_map = schedule.get_activities();
        for (let activity of activity_map.values()) {
            let dependencies: IActivityDependencyData[] = [];
            for (let dependency of activity.dependencies) {
                dependencies.push({
                    dependency_uuid: dependency.id,
                    lag: dependency.lag,
                    type: this.get_type_string(dependency.type),
                });
            }
            activities.push({
                ...this.extra_data_map.get(activity.id),
                uuid: activity.id,
                parent_uuid: activity.parent_id,
                planned_start_date: activity.planned_start_date
                    ? format(activity.planned_start_date, "yyyy-MM-dd")
                    : undefined,
                planned_end_date: activity.planned_end_date
                    ? format(activity.planned_end_date, "yyyy-MM-dd")
                    : undefined,
                duration: activity.get_duration(),
                completion_percentage: activity.completion_percentage,
                actual_start_date: activity.actual_start_date
                    ? format(activity.actual_start_date, "yyyy-MM-dd")
                    : undefined,
                actual_end_date: activity.actual_end_date
                    ? format(activity.actual_end_date, "yyyy-MM-dd")
                    : undefined,
                dependencies: dependencies,
                projected_start_date: format(
                    activity.get_projected_start_date(),
                    "yyyy-MM-dd"
                ),
                projected_end_date: format(
                    activity.get_projected_end_date(),
                    "yyyy-MM-dd"
                ),
                status: activity.get_status(),
                delay_by: activity.get_delayed_by(),
            });
        }
        return {
            uuid: schedule.root_id,
            activities: activities,
        };
    }
}
