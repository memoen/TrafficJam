import {merge, Subject} from "rxjs";
import {map, mapTo} from "rxjs/operators";

interface BuildingPopulationLeveling {
    maxPopulation: number,
}


class BuildingItem {
    private population: number = 0;
    private maxPopulation: number = 0;
    private currentLevel = 0;
    private onLevelUpSubject = new Subject();

    get onLevelUp() {
        return this.onLevelUpSubject;
    }

    get MaxPopulation() {
        return this.maxPopulation;
    }

    get CurrentLevel() {
        return this.currentLevel;
    }

    get Population() {
        return this.population;
    }

    constructor(private levelPopulation: BuildingPopulationLeveling[],) {
        this.maxPopulation = levelPopulation[0].maxPopulation;
    }

    private levelUp(): boolean {
        if (this.levelPopulation[this.currentLevel + 1]) {
            this.maxPopulation = this.levelPopulation[1 + this.currentLevel].maxPopulation;
            this.currentLevel++;
            this.onLevelUp.next(this.currentLevel);
            return true;
        }
        return false;
    }

    public addPopulation(valueToChange: number): number {
        /// return number of allocated population
        if (valueToChange < 0) {
            throw  "invalid population change";
        }

        while (valueToChange !== 0) {
            if (this.Population + valueToChange > this.MaxPopulation) {

                valueToChange -= this.MaxPopulation - this.Population;
                this.population = this.MaxPopulation;
                if (!this.levelUp()) {
                    return valueToChange;
                }
            } else {
                this.population += valueToChange;
                return 0;
            }

        }
    }


}


class CountrySideBuildingFactory {
    public build() {
        let levelMap = [{maxPopulation: 1}, {maxPopulation: 20},
            {maxPopulation: 30}, {maxPopulation: 40},
            {maxPopulation: 50}, {maxPopulation: 60}, {maxPopulation: 70}, {maxPopulation: 80}
            ,];
        return new BuildingItem(levelMap);
    }
}


export class CityArea {
    private houseFactory: CountrySideBuildingFactory = new CountrySideBuildingFactory();
    private cityCell: BuildingItem[] = [];
    private numberOfCars = [];
    private onAnyBuildingUpdateSubject = new Subject();

    get onAnyBuildingUpdate() {
        return this.onAnyBuildingUpdateSubject;
    }

    get NumberOfCars() {
        return this.numberOfCars;
    }

    constructor(private x: number, private y: number) {
        for (let i = 0; i < x; i++) {
            for (let j = 0; j < y; j++) {
                this.cityCell.push(this.houseFactory.build());

            }
        }
    }

    private buildOrderOfRandomFill(maxIndex: number) {
        let availableIndex = [];
        for (let i = 0; i < maxIndex; i++) {
            availableIndex.push(i);
        }

        let indexOrder = [];

        while (availableIndex.length > 0) {
            let index = Math.floor(Math.random() * availableIndex.length);
            indexOrder.push(availableIndex[index]);
            availableIndex = availableIndex.filter((e, i) => i !== index);
        }
        return indexOrder;

    }

    public addPopulationToRandomBuilding(value: number): boolean {
        let indexOrder = this.buildOrderOfRandomFill(this.cityCell.length);
        for (let i = 0; i < this.cityCell.length; i++) {

            let populationToFill = this.cityCell[indexOrder[i]].addPopulation(value);


            if (populationToFill == 0) {
                return true;
            } else {
                value = populationToFill;
            }
        }
        return false;
    }

    public getBuildingByCoord(x: number, y: number) {
        return this.cityCell[this.y * y + x];
    }

    public subscribe(func) {
        let buildingUpdateList = this.cityCell.map((build, i) => {
            return build.onLevelUp
        });
        for (let i = 0; i < buildingUpdateList.length; i++) {
            let stream = buildingUpdateList[i].pipe(map((level) => {
                return {index: i, level: level}
            }));
            stream.subscribe((level) => {
                this.onAnyBuildingUpdate.next(level);
            })
        }
        return this.onAnyBuildingUpdate.subscribe(func);
    }
}



