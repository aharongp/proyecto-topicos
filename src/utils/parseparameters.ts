import { parseFit, parseAngle, parseNonNegativeInteger, parsePositiveInteger, parseOptionalPositiveInteger, parseFilter, parseFormat } from "./validators";
import { FilterParameters, FormatParameters, CropParameters, ResizeParameters, RotationParameters } from "../types";
import { BadRequestError } from "../errors/AppError";

export function parseCropParams(parameters: Record<string, unknown>): CropParameters {
    return {
        left: parseNonNegativeInteger(parameters.left, "left"),
        top: parseNonNegativeInteger(parameters.top, "top"),
        width: parsePositiveInteger(parameters.width, "width"),
        height: parsePositiveInteger(parameters.height, "height"),
    };
}

export function parseResizeParams(parameters: Record<string, unknown>): ResizeParameters {
    const width = parseOptionalPositiveInteger(parameters.width, "width");
    const height = parseOptionalPositiveInteger(parameters.height, "height");
    if (!width && !height) {
        throw new BadRequestError("Width or height must be specified", "INVALID_PARAMETER");
    }
    return {
        width,
        height,
        fit: parseFit(parameters.fit),
    };
}

export function parseFormatParams(parameters: Record<string, unknown>): FormatParameters {
    return {
        format: parseFormat(parameters.format),
    };
}

export function parseRotationParams(parameters: Record<string, unknown>): RotationParameters {
    return {
        angle: parseAngle(parameters.angle),
    };
}

export function parseFilterParams(parameters: Record<string, unknown>): FilterParameters {
    const filter = parseFilter(parameters.filter);
    let value: number | undefined = parseOptionalPositiveInteger(parameters.value, "value");
    if (filter === "blur" && value === undefined) { //provide a default value if not provided and filter is blur
        value = 5;
    }
    return {
        filter,
        value,
    };
}