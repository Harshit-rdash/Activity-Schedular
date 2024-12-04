import { Activity, IDependency } from "./activity";
import { ACTIVITY_DEPENDENCY_TYPE } from "./enums";
import { add, max, format, differenceInDays, min } from "date-fns";

export class Schedule {
    static ScheduleBaseError = class extends Error {};

    static WrongScheduleError = class extends Schedule.ScheduleBaseError {};

    static ActivityNotFoundError = class extends Schedule.ScheduleBaseError {
        constructor(activity_id: string) {
            super(`Activity with id ${activity_id} not found`);
        }
    };

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
            throw new Schedule.ActivityNotFoundError(activity_id);
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
                if (dependency_activity.planned_end_date !== undefined) {
                    if (dependency.type === ACTIVITY_DEPENDENCY_TYPE.FS) {
                        planned_start_dates.push(
                            add(dependency_activity.planned_end_date, {
                                days: dependency.lag,
                            })
                        );
                    } else if (
                        dependency.type === ACTIVITY_DEPENDENCY_TYPE.FF
                    ) {
                        planned_end_dates.push(
                            add(dependency_activity.planned_end_date, {
                                days: dependency.lag,
                            })
                        );
                    }
                } else if (
                    dependency_activity.planned_start_date !== undefined
                ) {
                    if (dependency.type === ACTIVITY_DEPENDENCY_TYPE.SS) {
                        planned_start_dates.push(
                            add(dependency_activity.planned_start_date, {
                                days: dependency.lag,
                            })
                        );
                    } else if (
                        dependency.type === ACTIVITY_DEPENDENCY_TYPE.SF
                    ) {
                        planned_end_dates.push(
                            add(dependency_activity.planned_start_date, {
                                days: dependency.lag,
                            })
                        );
                    }
                }
            }
            activity.set_planned_start_date(max(planned_start_dates));
            activity.set_planned_end_date(max(planned_end_dates));
        }
        let planned_start_dates: Date[] = [];
        let planned_end_dates: Date[] = [];
        for (let child_id of activity.childs) {
            if (visited_set.has(child_id) == false) {
                this._process_activity(child_id, visited_set);
            }
            let child_activity = this.activity_map.get(child_id);
            if (!child_activity) {
                throw new Schedule.ActivityNotFoundError(child_id);
            }
            if (child_activity.planned_start_date) {
                planned_start_dates.push(child_activity.planned_start_date);
            }
            if (child_activity.planned_end_date) {
                planned_end_dates.push(child_activity.planned_end_date);
            }
        }
        activity.set_planned_start_date(min(planned_start_dates));
        activity.set_planned_end_date(max(planned_end_dates));
        visited_set.add(activity.id);
    }

    public process() {
        let visited_set = new Set<string>();
        this._process_activity(this.root_id, visited_set);

        console.log("Processing done");
        console.log(
            "Schedule Planned Start and End Dates",
            this.activity_map.get(this.root_id)?.planned_start_date,
            this.activity_map.get(this.root_id)?.planned_end_date
        );
        console.log(
            "Schedule Projected Start and End Dates",
            this.activity_map.get("1")?.get_projected_start_date(),
            this.activity_map.get("1")?.get_projected_end_date()
        );
        console.log(this.activity_map.get("1")?.get_status());
    }
}
