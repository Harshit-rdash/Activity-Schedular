import {
    ACTIVITY_STATUS,
    ACTIVITY_DEPENDENCY_TYPE,
    ACTIVITY_TYPE,
} from "./enums";
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
    type: ACTIVITY_TYPE;
    planned_start_date?: Date;
    planned_end_date?: Date;
    actual_start_date?: Date;
    actual_end_date?: Date;
    childs: Array<string>;
    dependencies: Array<IDependency>;
    completion_percentage: number;
    parent_id?: string;
    projected_start_date?: Date = undefined;
    projected_end_date?: Date = undefined;

    constructor(
        id: string,
        type: ACTIVITY_TYPE,
        planned_start_date?: Date,
        planned_end_date?: Date,
        actual_start_date?: Date,
        actual_end_date?: Date,
        childs: Array<string> = [],
        dependencies: Array<IDependency> = [],
        completion_percentage: number = 0,
        parent_id?: string,
        projected_start_date?: Date,
        projected_end_date?: Date,
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
        this.type = type;
        this.projected_start_date = projected_start_date;
        this.projected_end_date = projected_end_date;
    }

    private _get_duration(): number {
        if (this.planned_start_date && this.planned_end_date)
            return differenceInDays(
                this.planned_end_date,
                this.planned_start_date
            );
        throw new Activity.PlannedDateMissingError(
            `Planned start or end date is missing activity_id: ${this.id}`
        );
    }

    set_planned_start_date(date: Date): void {
        // removed this logic because it is not required to calculate the projected start date
        if (this.planned_start_date != null) {
            return;
        }
        this.planned_start_date = date;
        if (this.planned_end_date && isBefore(this.planned_end_date, date)) {
            this.set_planned_end_date(date);
        }
    }

    set_planned_end_date(date: Date): void {
        // removed this logic because it is not required to calculate the projected end date
        if (this.planned_end_date != null) {
            return;
        }
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

    set_actual_start_date(date?: Date): void {
        this.actual_start_date = date;
    }
    set_actual_end_date(date?: Date): void {
        if (date == undefined) {
            this.actual_end_date = date;
            return;
        }
        if (this.actual_start_date && isBefore(date, this.actual_start_date)) {
            throw new Activity.WrongInputEndDateError(
                "Input actual end date is before actual start date, please set actual start date first"
            );
        }
        this.actual_end_date = date;
    }

    set_projected_start_date(date: Date): void {
        if (this.type != ACTIVITY_TYPE.PROJECT)  {
            throw new Activity.ActivityBaseError(
                "Projected start date can only be set for project type activity"
            )
        }
        this.projected_start_date = date;
    }

    set_projected_end_date(date: Date): void {
        if (this.type != ACTIVITY_TYPE.PROJECT)  {
            throw new Activity.ActivityBaseError(
                "Projected start date can only be set for project type activity"
            )
        }
        this.projected_end_date = date;
    }

    get_duration(): number {
        if (this.type === ACTIVITY_TYPE.MILESTONE) {
            return 0;
        }
        return this._get_duration() + 1;
    }

    get_remaining_duration(): number {
        let duration = this._get_duration();
        return Math.ceil(duration * (1 - this.completion_percentage / 100));
    }

    get_projected_start_date(): Date {
        if (this.type != ACTIVITY_TYPE.TASK ) {
            if (this.projected_start_date === undefined) {
                throw new Activity.PlannedDateMissingError(
                    `Projected start date is missing, activity_id: ${this.id}, please process schedule first`
                );
            }
            return this.projected_start_date;
        }
        if (this.planned_start_date === undefined) {
            throw new Activity.PlannedDateMissingError(
                `Planned start date is missing, activity_id: ${this.id}`
            );
        }
        if (this.actual_start_date !== undefined) {
            return this.actual_start_date;
        }
        const today = this.get_today();
        if (
            isBefore(
                startOfDay(add(today, { days: -1 })),
                this.planned_start_date
            )
        ) {
            return this.planned_start_date;
        }
        return startOfDay(today);
    }

    get_projected_end_date(): Date {
        if (this.type != ACTIVITY_TYPE.TASK ) {
            if (this.projected_end_date === undefined) {
                throw new Activity.PlannedDateMissingError(
                    `Projected start date is missing, activity_id: ${this.id}, please process schedule first`
                );
            }
            return this.projected_end_date;
        }
        if (this.planned_end_date === undefined) {
            throw new Activity.PlannedDateMissingError(
                `Planned end date is missing, activity_id: ${this.id}`
            );
        }
        if (this.actual_end_date !== undefined) {
            return this.actual_end_date;
        }
        let duration = this.get_remaining_duration();
        if (this.actual_start_date == undefined) {
            return add(this.get_projected_start_date(), {
                days: duration ? duration : 0,
            });
        }

        return add(this.get_today(), {
            days: duration ? duration : 0,
        });
    }

    get_today(): Date {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    }

    get_status(): ACTIVITY_STATUS {
        if (this.is_on_time()) {
            return ACTIVITY_STATUS.ON_TIME;
        } else if (this.is_overdue()) {
            return ACTIVITY_STATUS.OVERDUE;
        } else if (this.is_delayed()) {
            return ACTIVITY_STATUS.DELAYED;
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
        if (this.planned_end_date === undefined) {
            throw new Activity.PlannedDateMissingError(
                `Planned start date is missing, activity_id: ${this.id}`
            );
        }
        if (
            this.actual_start_date == undefined &&
            isAfter(
                this.get_projected_start_date(),
                this.get_planned_end_date()
            )
        ) {
            return true;
        }
        return false;
    }

    get_delayed_by(): number {
        if (this.is_on_time()) {
            return 0;
        } else if (this.is_overdue()) {
            return differenceInDays(
                this.get_projected_start_date(),
                this.get_planned_end_date()
            );
        } else if (this.is_delayed()) {
            return differenceInDays(
                this.get_projected_end_date(),
                this.get_planned_end_date()
            );
        }
        throw new Activity.StatusConditionNotMatchedError();
    }
}
