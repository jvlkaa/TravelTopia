import {Point} from "../../point/model/point";

export interface Route {
    name: string;
    routePoints: Point[];
    userCreated: boolean;
    type: string;
    equipment: string;
    difficulty: string;
    description: string;
    time: number;
}
