import {Point} from "../../point/model/point";

export interface RouteWithId {
    id: string;
    name: string;
    routePoints: Point[];
    userCreated: boolean;
    type: string;
}
