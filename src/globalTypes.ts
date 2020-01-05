export interface PositionXAsix {
    x: number,
}
export interface Position3D {
    x:number,
    y:number,
    z:number,
}

export enum reactionLevel {
    move,
    acselerate,
    break
}

export interface ISafeInterval {
    minSafe: number,
    minDanger: number
}

export enum OnRoadObjectList {
    car,
    trafficlight,
    brick,
    sign,
}

export interface ItemLocatedOnRoad {
    Location: PositionXAsix,
    type: OnRoadObjectList,
    lineAlocate:number,
    getInfoForAP,
    ApCall,
    onDespawn?,
}

export interface ITrafficSession {
    isAbleToRun: boolean;
    timeToChange: number;
    getState;
    move;
}


export interface IApilotInfo {
    location: PositionXAsix,
    type: OnRoadObjectList,
    vector: PositionXAsix,
    lineAlocate: number,
    lightInfo?: ITrafficSession,
}
