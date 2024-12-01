import { Activity, IDependency } from "./activity";
import { DependencyTypeEnum } from "./enums";
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
        let dependency_activity: Activity | undefined = this.activity_map.get(
            dependency.id
        );
        if (dependency_activity == null) {
            throw new Schedule.ActivityNotFoundError(dependency.id);
        }
        if (dependency.type == DependencyTypeEnum.FS) {
            if (dependency_activity.planned_end_date == null) {
                throw new Schedule.WrongDateError(
                    `Planned end date of activity ${dependency.id} is null`
                );
            }
            if (activity.planned_start_date == null) {
                activity.planned_start_date = add(
                    dependency_activity.planned_end_date,
                    { days: dependency.lag }
                );
            } else {
                activity.planned_start_date = max([
                    add(dependency_activity.planned_end_date, {
                        days: dependency.lag,
                    }),
                    activity.planned_start_date,
                ]);
            }
        } else if (dependency.type == DependencyTypeEnum.SS) {
            if (dependency_activity.planned_start_date == null) {
                throw new Schedule.WrongDateError(
                    `Actual start date of activity ${dependency.id} is null`
                );
            }
            if (activity.planned_start_date == null) {
                activity.planned_start_date = add(
                    dependency_activity.planned_start_date,
                    { days: dependency.lag }
                );
            } else {
                activity.planned_start_date = max([
                    add(dependency_activity.planned_start_date, {
                        days: dependency.lag,
                    }),
                    activity.planned_start_date,
                ]);
            }
        } else if (dependency.type == DependencyTypeEnum.FF) {
            if (dependency_activity.planned_end_date == null) {
                throw new Schedule.WrongDateError(
                    `Planned end date of activity ${dependency.id} is null`
                );
            }
            if (activity.planned_end_date == null) {
                activity.planned_end_date = add(
                    dependency_activity.planned_end_date,
                    { days: dependency.lag }
                );
            } else {
                activity.planned_end_date = max([
                    add(dependency_activity.planned_end_date, {
                        days: dependency.lag,
                    }),
                    activity.planned_end_date,
                ]);
            }
        } else if (dependency.type == DependencyTypeEnum.SF) {
            if (dependency_activity.planned_end_date == null) {
                throw new Schedule.WrongDateError(
                    `Actual end date of activity ${dependency.id} is null`
                );
            }
            if (activity.planned_end_date == null) {
                activity.planned_end_date = add(
                    dependency_activity.planned_end_date,
                    { days: dependency.lag }
                );
            }
            activity.planned_end_date = max([
                add(dependency_activity.planned_end_date, {
                    days: dependency.lag,
                }),
                activity.planned_end_date,
            ]);
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

    // question
    // if B -> A' FS+4 Then start of b equal and greater than end of A + 4 means A + 5 was accepted
    // if B -> A' FS-4 Then start of b equal and greater than end of A - 4 means  A - 3 was accepted

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
    }
}
