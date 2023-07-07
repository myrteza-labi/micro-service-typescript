"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const ramda_1 = require("ramda");
test('GET /voitures should retrieve an array of cars with expected properties', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.get('http://localhost:4000/voitures');
    expect(response.status).toBe(200);
    const expectedProperties = { couleur: expect.stringMatching(/.*/), marque: expect.stringMatching(/.*/) };
    const cars = response.data;
    expect(Array.isArray(cars)).toBe(true);
    (0, ramda_1.map)((car) => {
        expect(car).toEqual(expect.objectContaining(expectedProperties));
    })(cars);
}));
test('POST /voitures should create a new car', () => __awaiter(void 0, void 0, void 0, function* () {
    const newCar = {
        couleur: 'Blue',
        marque: 'BMW'
    };
    const response = yield axios_1.default.post('http://localhost:4000/voitures', newCar);
    expect(response.status).toBe(201); // Assuming 201 for successful creation
    // Ignorer la propriété `_id` lors de la comparaison
    const { _id, __v } = newCar, expectedCar = __rest(newCar, ["_id", "__v"]);
    expect(response.data).toEqual(expect.objectContaining(expectedCar));
}));
