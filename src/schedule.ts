import { Activity, IDependency } from "./activity";
import { ACTIVITY_DEPENDENCY_TYPE } from "./enums";
import { add, max, format, differenceInDays } from "date-fns";

export class Schedule {
    static ScheduleBaseError = class extends Error {
        constructor(message: string) {
            super(message);
        }
    };

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

    private _handle_dependency(
        activity: Activity,
        dependency: IDependency
    ): void {
        // This method set's start and end dates of dependent activity based on dependency
        // Fetch dependency, raise Schedule.ActivityNotFoundError
        // If dependency is FS -> set start date of activity to max(end date of dependency + lag, start date ) raise Schedule.WrongDateError
        // If dependency is SS -> set start date of activity to max(start date of dependency + lag, end date )  raise Schedule.WrongDateError
        // If dependency is FF -> set end date of activity to max(end date of dependency + lag, end date )  raise Schedule.WrongDateError
        // If dependency is SF -> set end date of activity to max(start date of dependency + lag, end date )  raise Schedule.WrongDateError
        // if end date < start date -> set end date to start date

        let dependency_activity: Activity | undefined = this.activity_map.get(
            dependency.id
        );
        if (dependency_activity == undefined) {
            throw new Schedule.ActivityNotFoundError(dependency.id);
        }
        if (dependency.type == ACTIVITY_DEPENDENCY_TYPE.FS) {
            if (dependency_activity.planned_end_date == undefined) {
                throw new Schedule.WrongDateError(
                    `Planned end date of activity ${dependency.id} is null`
                );
            }
            activity.set_planned_start_date_by_dependency(
                add(dependency_activity.planned_end_date, {
                    days: dependency.lag,
                })
            );
        } else if (dependency.type == ACTIVITY_DEPENDENCY_TYPE.SS) {
            if (dependency_activity.planned_start_date == undefined) {
                throw new Schedule.WrongDateError(
                    `Actual start date of activity ${dependency.id} is null`
                );
            }
            activity.set_planned_start_date_by_dependency(
                add(dependency_activity.planned_start_date, {
                    days: dependency.lag,
                })
            );
        } else if (dependency.type == ACTIVITY_DEPENDENCY_TYPE.FF) {
            if (dependency_activity.planned_end_date == null) {
                throw new Schedule.WrongDateError(
                    `Planned end date of activity ${dependency.id} is null`
                );
            }
            activity.set_planned_end_date_by_dependency(
                add(dependency_activity.planned_end_date, {
                    days: dependency.lag,
                })
            );
        } else if (dependency.type == ACTIVITY_DEPENDENCY_TYPE.SF) {
            if (dependency_activity.planned_end_date == null) {
                throw new Schedule.WrongDateError(
                    `Actual end date of activity ${dependency.id} is null`
                );
            }
            activity.set_planned_end_date_by_dependency(
                add(dependency_activity.planned_end_date, {
                    days: dependency.lag,
                })
            );
        }
    }

    private _handle_child(activity: Activity, child_id: string): void {
        let child_activity: Activity | undefined =
            this.activity_map.get(child_id);
        if (child_activity == null) {
            throw new Schedule.ActivityNotFoundError(child_id);
        }
        if (activity.planned_start_date == null) {
            activity.planned_start_date = child_activity.planned_start_date;
        } else {
            if (child_activity.planned_start_date == null) {
                throw new Schedule.WrongDateError(
                    `Planned start date of activity ${child_id} is null`
                );
            }
            activity.planned_start_date = max([
                activity.planned_start_date,
                child_activity.planned_start_date,
            ]);
        }
        if (activity.planned_end_date == null) {
            activity.planned_end_date = child_activity.planned_end_date;
        } else {
            if (child_activity.planned_end_date == null) {
                throw new Schedule.WrongDateError(
                    `Planned end date of activity ${child_id} is null`
                );
            }
            activity.planned_end_date = max([
                activity.planned_end_date,
                child_activity.planned_end_date,
            ]);
        }
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
        // Base Case
        if (activity.childs.length == 0 && activity.dependencies.length == 0) {
            return;
        }
        if (activity.childs.length == 0) {
            for (let dependency of activity.dependencies) {
                if (visited_set.has(dependency.id) == false) {
                    this._process_activity(dependency.id, visited_set);
                }
                this._handle_dependency(activity, dependency);
            }
            return;
        }
        for (let child_id of activity.childs) {
            if (visited_set.has(child_id) == false) {
                this._process_activity(child_id, visited_set);
            }
            this._handle_child(activity, child_id);
        }
        visited_set.add(activity.id);
    }

    public process() {
        let visited_set = new Set<string>();
        this._process_activity(this.root_id, visited_set);

        console.log("Processing done");
        console.log(
            "Schedule Start and End Dates",
            this.activity_map.get(this.root_id)?.planned_start_date,
            this.activity_map.get(this.root_id)?.planned_end_date
        );
    }
}
