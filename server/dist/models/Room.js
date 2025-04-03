"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const panoramaSchema = new mongoose_1.default.Schema({
    url: {
        type: String,
        required: true
    },
    tag: {
        type: String,
        default: ''
    }
});
const roomSchema = new mongoose_1.default.Schema({
    buildingId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Building',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    floor: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        default: ''
    },
    panoramas: {
        type: [panoramaSchema],
        default: [],
        validate: {
            validator: function (panoramas) {
                return panoramas.length <= 10;
            },
            message: '파노라마 이미지는 최대 10개까지만 등록할 수 있습니다.'
        }
    }
});
exports.default = mongoose_1.default.model('Room', roomSchema);
