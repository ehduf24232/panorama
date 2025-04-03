"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const buildingSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    neighborhoodId: { type: String, required: true },
    address: { type: String, required: true },
    floors: { type: Number, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, default: '' }
});
const Building = mongoose_1.default.model('Building', buildingSchema);
exports.default = Building;
