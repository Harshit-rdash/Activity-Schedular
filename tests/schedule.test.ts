import { ACTIVITY_DEPENDENCY_TYPE } from "../src";
import { Activity } from "../src/activity";
import { Schedule } from "../src/schedule";

describe("Schedule Test Suite", function () {
    it("Case 1: ", function () {
        let activity_map: Map<string, Activity> = new Map();
        activity_map.set(
            "0",
            new Activity(
                "0",
                undefined,
                undefined,
                undefined,
                undefined,
                [ "1", "2"],
                [],
                0,
                undefined
            )
        );
        activity_map.set(
            "1",
            new Activity(
                "1",
                new Date("2025-01-01"),
                new Date("2025-01-10"),
                undefined,
                undefined,
                [],
                [],
                0,
                undefined
            )
        );
        activity_map.set(
            "2",
            new Activity(
                "2",
                new Date("2025-01-05"),
                new Date("2025-02-10"),
                undefined,
                undefined,
                [],
                [
                    {
                        id: "1",
                        lag: 1,
                        type: ACTIVITY_DEPENDENCY_TYPE.FS,
                    },
                ],
                0,
                undefined
            )
        );
        let schedule = new Schedule("0", activity_map);
        schedule.process()
        expect(
            schedule.activity_map.get(schedule.root_id)?.get_planned_start_date()
        ).toStrictEqual(
            new Date("2025-01-01")
        )
    });
});
