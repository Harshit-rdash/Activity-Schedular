import { Activity, IDependency } from "./activity";
import { ACTIVITY_DEPENDENCY_TYPE } from "./enums";
import { add, max, format, differenceInDays, min } from "date-fns";

export class Schedule {
    static ScheduleBaseError = class extends Error {};
    static WrongScheduleError = class extends Schedule.ScheduleBaseError {};
    static ActivityNotFoundError = class extends Schedule.ScheduleBaseError {};
    static WrongDateError = class extends Schedule.ScheduleBaseError {};

    activity_map: Map<string, Activity>;
    root_id: string;

    constructor(root_id: string, activity_map: Map<string, Activity>) {
        this.root_id = root_id;
        this.activity_map = activity_map;
    }

    private _process_activity(
        activity_id: string,
        visited_set: Set<string>
    ): void {
        let activity = this.activity_map.get(activity_id);
        if (activity == null) {
            throw new Schedule.ActivityNotFoundError(
                `Activity with id ${activity_id} not found`
            );
        }
        if (activity.childs.length > 0 && activity.dependencies.length > 0) {
            throw new Schedule.WrongScheduleError(
                "Parent activity must not have dependencies"
            );
        }
        if (activity.childs.length == 0) {
            let planned_start_dates: Date[] = [];
            let planned_end_dates: Date[] = [];
            for (let dependency of activity.dependencies) {
                if (visited_set.has(dependency.id) == false) {
                    this._process_activity(dependency.id, visited_set);
                }
                let dependency_activity = this.activity_map.get(dependency.id);
                if (!dependency_activity) {
                    throw new Schedule.ActivityNotFoundError(dependency.id);
                }

                if (dependency.type === ACTIVITY_DEPENDENCY_TYPE.FS) {
                    planned_start_dates.push(
                        add(dependency_activity.get_planned_end_date(), {
                            days: dependency.lag,
                        })
                    );
                } else if (dependency.type === ACTIVITY_DEPENDENCY_TYPE.FF) {
                    planned_end_dates.push(
                        add(dependency_activity.get_planned_end_date(), {
                            days: dependency.lag,
                        })
                    );
                } else if (dependency.type === ACTIVITY_DEPENDENCY_TYPE.SS) {
                    planned_start_dates.push(
                        add(dependency_activity.get_planned_start_date(), {
                            days: dependency.lag,
                        })
                    );
                } else if (dependency.type === ACTIVITY_DEPENDENCY_TYPE.SF) {
                    planned_end_dates.push(
                        add(dependency_activity.get_planned_start_date(), {
                            days: dependency.lag,
                        })
                    );
                }
            }
            if (planned_start_dates.length > 0) {
                activity.set_planned_start_date(max(planned_start_dates));
            }
            if (planned_end_dates.length > 0) {
                activity.set_planned_end_date(max(planned_end_dates));
            }
        }
        if (activity.childs.length > 0) {
            let planned_start_dates: Date[] = [];
            let planned_end_dates: Date[] = [];
            let actual_start_dates: Date[] = [];
            let actual_end_dates: Date[] = [];
            let total_duration: number = 0;
            let weighted_completion_sum: number = 0;
            for (let child_id of activity.childs) {
                if (visited_set.has(child_id) == false) {
                    this._process_activity(child_id, visited_set);
                }
                let child_activity = this.activity_map.get(child_id);
                if (!child_activity) {
                    throw new Schedule.ActivityNotFoundError(child_id);
                }
                planned_start_dates.push(child_activity.get_planned_start_date());
                planned_end_dates.push(child_activity.get_planned_end_date());
                let actual_start_date = child_activity.get_actual_start_date();
                if (actual_start_date) {
                    actual_start_dates.push(actual_start_date);
                }
                let actual_end_date = child_activity.get_actual_end_date();
                if (actual_end_date) {
                    actual_end_dates.push(actual_end_date);
                }
                let child_duration = child_activity.get_duration();
                weighted_completion_sum +=
                    child_activity.completion_percentage * child_duration;
                total_duration += child_duration;
            }
            if (planned_start_dates.length > 0) {
                activity.set_planned_start_date(min(planned_start_dates));
            }
            if (planned_end_dates.length > 0) {
                activity.set_planned_end_date(max(planned_end_dates));
            }
            if (actual_start_dates.length > 0) {
                activity.set_actual_start_date(min(actual_start_dates));
            }
            let completion_percentage = weighted_completion_sum
                ? weighted_completion_sum / total_duration
                : 0;
            activity.set_completion_percentage(completion_percentage);
            if (completion_percentage === 100) {
                activity.set_actual_end_date(max(actual_end_dates));
            }
        }

        visited_set.add(activity.id);
    }

    public process() {
        let visited_set = new Set<string>();
        this._process_activity(this.root_id, visited_set);
        console.log("Processing done");
    }

    public get_root(): string {
        return this.root_id;
    }

    public get_activities(): Map<string, Activity> {
        return this.activity_map;
    }
}
