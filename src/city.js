"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var BuildingItem = /** @class */ (function () {
    function BuildingItem(levelPopulation) {
        this.levelPopulation = levelPopulation;
        this.population = 0;
        this.maxPopulation = 0;
        this.currentLevel = 0;
        this.onLevelUpSubject = new rxjs_1.Subject();
        this.maxPopulation = levelPopulation[0].maxPopulation;
    }
    Object.defineProperty(BuildingItem.prototype, "onLevelUp", {
        get: function () {
            return this.onLevelUpSubject;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BuildingItem.prototype, "MaxPopulation", {
        get: function () {
            return this.maxPopulation;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BuildingItem.prototype, "CurrentLevel", {
        get: function () {
            return this.currentLevel;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BuildingItem.prototype, "Population", {
        get: function () {
            return this.population;
        },
        enumerable: true,
        configurable: true
    });
    BuildingItem.prototype.levelUp = function () {
        if (this.levelPopulation[this.currentLevel + 1]) {
            this.maxPopulation = this.levelPopulation[1 + this.currentLevel].maxPopulation;
            this.currentLevel++;
            this.onLevelUp.next(this.currentLevel);
            return true;
        }
        return false;
    };
    BuildingItem.prototype.addPopulation = function (valueToChange) {
        /// return number of allocated population
        if (valueToChange < 0) {
            throw "invalid population change";
        }
        while (valueToChange !== 0) {
            if (this.Population + valueToChange > this.MaxPopulation) {
                valueToChange -= this.MaxPopulation - this.Population;
                this.population = this.MaxPopulation;
                if (!this.levelUp()) {
                    return valueToChange;
                }
            }
            else {
                this.population += valueToChange;
                return 0;
            }
        }
    };
    return BuildingItem;
}());
var CountrySideBuildingFactory = /** @class */ (function () {
    function CountrySideBuildingFactory() {
    }
    CountrySideBuildingFactory.prototype.build = function () {
        var levelMap = [{ maxPopulation: 1 }, { maxPopulation: 20 },
            { maxPopulation: 30 }, { maxPopulation: 40 },
            { maxPopulation: 50 }, { maxPopulation: 60 }, { maxPopulation: 70 }, { maxPopulation: 80 },
        ];
        return new BuildingItem(levelMap);
    };
    return CountrySideBuildingFactory;
}());
var CityArea = /** @class */ (function () {
    function CityArea(x, y) {
        this.x = x;
        this.y = y;
        this.houseFactory = new CountrySideBuildingFactory();
        this.cityCell = [];
        this.numberOfCars = [];
        this.onAnyBuildingUpdateSubject = new rxjs_1.Subject();
        for (var i = 0; i < x; i++) {
            for (var j = 0; j < y; j++) {
                this.cityCell.push(this.houseFactory.build());
            }
        }
    }
    Object.defineProperty(CityArea.prototype, "onAnyBuildingUpdate", {
        get: function () {
            return this.onAnyBuildingUpdateSubject;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CityArea.prototype, "NumberOfCars", {
        get: function () {
            return this.numberOfCars;
        },
        enumerable: true,
        configurable: true
    });
    CityArea.prototype.buildOrderOfRandomFill = function (maxIndex) {
        var availableIndex = [];
        for (var i = 0; i < maxIndex; i++) {
            availableIndex.push(i);
        }
        var indexOrder = [];
        var _loop_1 = function () {
            var index = Math.floor(Math.random() * availableIndex.length);
            indexOrder.push(availableIndex[index]);
            availableIndex = availableIndex.filter(function (e, i) { return i !== index; });
        };
        while (availableIndex.length > 0) {
            _loop_1();
        }
        return indexOrder;
    };
    CityArea.prototype.addPopulationToRandomBuilding = function (value) {
        var indexOrder = this.buildOrderOfRandomFill(this.cityCell.length);
        for (var i = 0; i < this.cityCell.length; i++) {
            var populationToFill = this.cityCell[indexOrder[i]].addPopulation(value);
            if (populationToFill == 0) {
                return true;
            }
            else {
                value = populationToFill;
            }
        }
        return false;
    };
    CityArea.prototype.getBuildingByCoord = function (x, y) {
        return this.cityCell[this.y * y + x];
    };
    CityArea.prototype.subscribe = function (func) {
        var _this = this;
        var buildingUpdateList = this.cityCell.map(function (build, i) {
            return build.onLevelUp;
        });
        var _loop_2 = function (i) {
            var stream = buildingUpdateList[i].pipe(operators_1.map(function (level) {
                return { index: i, level: level };
            }));
            stream.subscribe(function (level) {
                _this.onAnyBuildingUpdate.next(level);
            });
        };
        for (var i = 0; i < buildingUpdateList.length; i++) {
            _loop_2(i);
        }
        return this.onAnyBuildingUpdate.subscribe(func);
    };
    return CityArea;
}());
exports.CityArea = CityArea;
//# sourceMappingURL=city.js.map