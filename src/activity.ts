import { ACTIVITY_STATUS, ACTIVITY_DEPENDENCY_TYPE } from "./enums";
import { add, max, format, differenceInDays, min } from "date-fns";

export interface IDependency {
    id: string;
    lag: number;
    type: ACTIVITY_DEPENDENCY_TYPE;
}

export class Activity {
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

    get_status(): ACTIVITY_STATUS {
        return ACTIVITY_STATUS.ON_TIME;
    }

    set_planned_start_date(date: Date, is_dependency: boolean = false): void {
        const func = is_dependency ? max : min;
        let dates: Date[] = [date];
        if (this.planned_start_date) {
            dates.push(this.planned_start_date);
        }
        this.planned_start_date = func(dates);
        this.set_planned_end_date(date);
    }

    set_planned_end_date(date: Date): void {
        let dates: Date[] = [date];
        if (this.planned_start_date) {
            dates.push(this.planned_start_date);
        }
        if (this.planned_end_date) {
            dates.push(this.planned_end_date);
        }
        this.planned_end_date = max(dates);
    }
}
