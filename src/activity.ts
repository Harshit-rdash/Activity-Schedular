import { ActivityStatusEnum, DependencyTypeEnum } from "./enums";

export interface IDependency {
    id: string;
    lag: number;
    type: DependencyTypeEnum;
}

export class Activity {
    id: string;
    planned_start_date: Date | null;
    planned_end_date: Date | null;
    duration: number | null;
    actual_start_date: Date | null;
    actual_end_date: Date | null;
    projected_start_date: Date | null;
    projected_end_date: Date | null;
    status: ActivityStatusEnum | null;
    childs: Array<string>;
    dependencies: Array<IDependency>;
    completion_precentage: number;

    constructor(
        id: string,
        planned_start_date: Date | null = null,
        planned_end_date: Date | null = null,
        actual_start_date: Date | null = null,
        actual_end_date: Date | null = null,
        projected_start_date: Date | null = null,
        projected_end_date: Date | null = null,
        status: ActivityStatusEnum | null = null,
        duration: number | null = null,
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
        this.status = status;
        this.duration = duration;
        this.childs = childs;
        this.dependencies = dependencies;
        this.completion_precentage = completion_precentage;
    }
}
