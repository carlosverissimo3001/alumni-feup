/* tslint:disable */
/* eslint-disable */
/**
 * API
 * API description
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface DataPointDto
 */
export interface DataPointDto {
    /**
     * The label of the data point
     * @type {string}
     * @memberof DataPointDto
     */
    label: string;
    /**
     * The value of the data point
     * @type {number}
     * @memberof DataPointDto
     */
    value: number;
}

/**
 * Check if a given object implements the DataPointDto interface.
 */
export function instanceOfDataPointDto(value: object): value is DataPointDto {
    if (!('label' in value) || value['label'] === undefined) return false;
    if (!('value' in value) || value['value'] === undefined) return false;
    return true;
}

export function DataPointDtoFromJSON(json: any): DataPointDto {
    return DataPointDtoFromJSONTyped(json, false);
}

export function DataPointDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): DataPointDto {
    if (json == null) {
        return json;
    }
    return {
        
        'label': json['label'],
        'value': json['value'],
    };
}

export function DataPointDtoToJSON(json: any): DataPointDto {
    return DataPointDtoToJSONTyped(json, false);
}

export function DataPointDtoToJSONTyped(value?: DataPointDto | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'label': value['label'],
        'value': value['value'],
    };
}

