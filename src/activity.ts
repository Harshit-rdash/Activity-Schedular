import { ACTIVITY_STATUS, ACTIVITY_DEPENDENCY_TYPE } from "./enums";
import {
    add,
    max,
    format,
    differenceInDays,
    min,
    isBefore,
    isAfter,
    startOfDay,
    isEqual,
} from "date-fns";
export interface IDependency {
    id: string;
    lag: number;
    type: ACTIVITY_DEPENDENCY_TYPE;
}

export class Activity {
    static ActivityBaseError = class extends Error {};
    static PlannedDateMissingError = class extends Activity.ActivityBaseError {};
    static StatusConditionNotMatchedError = class extends Activity.ActivityBaseError {};
    static WrongInputEndDateError = class extends Activity.ActivityBaseError {};

    id: string;
    planned_start_date?: Date;
    planned_end_date?: Date;
    actual_start_date?: Date;
    actual_end_date?: Date;
    projected_start_date?: Date;
    projected_end_date?: Date;
    childs: Array<string>;
    dependencies: Array<IDependency>;
    completion_precentage: number;

    constructor(
        id: string,
        planned_start_date?: Date,
        planned_end_date?: Date,
        actual_start_date?: Date,
        actual_end_date?: Date,
        projected_start_date?: Date,
        projected_end_date?: Date,
        childs: Array<string> = [],
        dependencies: Array<IDependency> = [],
        completion_precentage: number = 0
    ) {
        this.id = id;
        this.planned_start_date = planned_start_date;
        this.planned_end_date = planned_end_date;
        this.actual_start_date = actual_start_date;
        this.actual_end_date = actual_end_date;
        this.projected_start_date = projected_start_date;
        this.projected_end_date = projected_end_date;
        this.childs = childs;
        this.dependencies = dependencies;
        this.completion_precentage = completion_precentage;
    }

    get_duration(): number | null {
        if (this.planned_start_date && this.planned_end_date)
            return (
                differenceInDays(
                    this.planned_end_date,
                    this.planned_start_date
                ) + 1
            );
        return null;
    }

    get_remaining_duration(): number | null {
        let duration = this.get_duration();
        if (duration === null) {
            return null;
        }
        return Math.floor(duration * (1 - this.completion_precentage / 100));
    }

    set_planned_start_date(date: Date): void {
        this.planned_start_date = date;
        if (this.planned_end_date && isBefore(this.planned_end_date, date)) {
            this.set_planned_end_date(date);
        }
    }

    set_planned_end_date(date: Date): void {
        if (
            this.planned_start_date &&
            isBefore(date, this.planned_start_date)
        ) {
            throw new Activity.ActivityBaseError(
                `Input end date is less then start date, please set start date first, end_date: ${this.planned_end_date}, input: ${date}`
            );
        }
        this.planned_end_date = date;
    }

    get_projected_start_date(): Date {
        if (this.planned_start_date === undefined) {
            throw new Activity.PlannedDateMissingError(
                `Planned start date is missing, activity_id: ${this.id}`
            );
        }
        if (this.actual_start_date !== undefined) {
            return this.actual_start_date;
        }
        if (
            isBefore(
                startOfDay(add(Date(), { days: -1 })),
                this.planned_start_date
            )
        ) {
            return this.planned_start_date;
        }
        return startOfDay(Date());
    }

    get_projected_end_date(): Date {
        if (this.planned_end_date === undefined) {
            throw new Activity.PlannedDateMissingError(
                `Planned end date is missing, activity_id: ${this.id}`
            );
        }
        if (this.actual_end_date !== undefined) {
            return this.actual_end_date;
        }
        let duration = this.get_remaining_duration();
        return add(this.get_projected_start_date(), {
            days: duration ? duration : 0,
        });
    }

    get_status(): ACTIVITY_STATUS {
        if (this.is_on_time()) {
            return ACTIVITY_STATUS.ON_TIME;
        } else if (this.is_delayed()) {
            return ACTIVITY_STATUS.DELAYED;
        } else if (this.is_overdue()) {
            return ACTIVITY_STATUS.OVERDUE;
        }
        throw new Activity.StatusConditionNotMatchedError();
    }

    is_on_time(): boolean {
        if (this.planned_end_date === undefined) {
            throw new Activity.PlannedDateMissingError();
        }
        if (
            this.actual_start_date === undefined &&
            this.planned_end_date !== undefined &&
            isBefore(
                startOfDay(add(Date(), { days: -1 })),
                this.planned_end_date
            )
        ) {
            return true;
        } else if (
            this.actual_start_date &&
            this.actual_end_date &&
            isBefore(
                add(this.actual_end_date, { days: -1 }),
                this.planned_end_date
            )
        ) {
            return true;
        }
        return false;
    }

    is_delayed(): boolean {
        if (this.planned_end_date === undefined) {
            throw new Activity.PlannedDateMissingError();
        }
        if (
            this.actual_end_date === undefined &&
            isAfter(startOfDay(Date()), this.planned_end_date)
        ) {
            return true;
        } else if (
            this.actual_end_date &&
            isAfter(this.actual_end_date, this.planned_end_date)
        ) {
            return true;
        }
        return false;
    }

    is_overdue(): boolean {
        if (this.planned_end_date === undefined) {
            throw new Activity.PlannedDateMissingError();
        }
        if (
            this.actual_start_date === undefined &&
            isAfter(startOfDay(Date()), this.planned_end_date)
        ) {
            return true;
        }
        return false;
    }
}
