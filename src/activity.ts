import { ACTIVITY_STATUS, ACTIVITY_DEPENDENCY_TYPE } from "./enums";
import {
    add,
    differenceInDays,
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
    childs: Array<string>;
    dependencies: Array<IDependency>;
    completion_percentage: number;
    parent_id?: string;

    constructor(
        id: string,
        planned_start_date?: Date,
        planned_end_date?: Date,
        actual_start_date?: Date,
        actual_end_date?: Date,
        childs: Array<string> = [],
        dependencies: Array<IDependency> = [],
        completion_percentage: number = 0,
        parent_id?: string
    ) {
        this.id = id;
        this.planned_start_date = planned_start_date;
        this.planned_end_date = planned_end_date;
        this.actual_start_date = actual_start_date;
        this.actual_end_date = actual_end_date;
        this.childs = childs;
        this.dependencies = dependencies;
        this.completion_percentage = completion_percentage;
        this.parent_id = parent_id;
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

    set_completion_percentage(completion_percentage: number): void {
        this.completion_percentage = completion_percentage;
    }

    isValidDate(date: Date): boolean {
        return !isNaN(date.getTime());
    }
    set_actual_start_date(date: Date): void {
        console.log(`${this.id} ${this.isValidDate(date)}`);
        if (this.isValidDate(date)) {
            this.actual_start_date = date;
        }
    }
    set_actual_end_date(date: Date): void {
        if (this.actual_start_date && isBefore(date, this.actual_start_date)) {
            throw new Activity.WrongInputEndDateError(
                "Input actual end date is before actual start date, please set actual start date first"
            );
        }
        this.actual_start_date = date;
    }

    get_duration(): number {
        if (this.planned_start_date && this.planned_end_date)
            return (
                differenceInDays(
                    this.planned_end_date,
                    this.planned_start_date
                ) + 1
            );
        throw new Activity.PlannedDateMissingError(
            `Planned start or end date is missing activity_id: ${this.id}`
        );
    }

    get_remaining_duration(): number {
        let duration = this.get_duration();
        return Math.floor(duration * (1 - this.completion_percentage / 100));
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
        return add(Date(), {
            days: duration ? duration - 1 : 0,
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

    get_planned_start_date(): Date {
        if (this.planned_start_date === undefined) {
            throw new Activity.PlannedDateMissingError(
                `planned_start_date is missing activity_id: ${this.id}`
            );
        }
        return this.planned_start_date;
    }

    get_planned_end_date(): Date {
        if (this.planned_end_date === undefined) {
            throw new Activity.PlannedDateMissingError(
                `planned_end_date is missing activity_id: ${this.id}`
            );
        }
        return this.planned_end_date;
    }

    get_actual_start_date(): Date | undefined {
        return this.actual_start_date;
    }

    get_actual_end_date(): Date | undefined {
        return this.actual_end_date;
    }

    get_completion_percentage(): number {
        return this.completion_percentage;
    }

    get_parent_id(): string | undefined {
        return this.parent_id;
    }

    is_on_time(): boolean {
        if (this.planned_end_date === undefined) {
            throw new Activity.PlannedDateMissingError();
        }
        if (
            isBefore(this.get_projected_end_date(), this.planned_end_date) ||
            isEqual(this.get_projected_end_date(), this.planned_end_date)
        ) {
            return true;
        }
        return false;
    }

    is_delayed(): boolean {
        if (this.planned_end_date === undefined) {
            throw new Activity.PlannedDateMissingError();
        }
        if (isAfter(this.get_projected_end_date(), this.planned_end_date)) {
            return true;
        }
        return false;
    }

    is_overdue(): boolean {
        if (this.planned_start_date === undefined) {
            throw new Activity.PlannedDateMissingError(
                `Planned start date is missing, activity_id: ${this.id}`
            );
        }
        if (isAfter(this.get_projected_start_date(), this.planned_start_date)) {
            return true;
        }
        return false;
    }
}
