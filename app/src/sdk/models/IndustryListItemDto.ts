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
import type { DataPointDto } from './DataPointDto';
import {
    DataPointDtoFromJSON,
    DataPointDtoFromJSONTyped,
    DataPointDtoToJSON,
    DataPointDtoToJSONTyped,
} from './DataPointDto';

/**
 * 
 * @export
 * @interface IndustryListItemDto
 */
export interface IndustryListItemDto {
    /**
     * The ID of the industry
     * @type {string}
     * @memberof IndustryListItemDto
     */
    id: string;
    /**
     * The name of the industry
     * @type {string}
     * @memberof IndustryListItemDto
     */
    name: string;
    /**
     * The number of alumni working in the industry
     * @type {number}
     * @memberof IndustryListItemDto
     */
    count: number;
    /**
     * The alumni trend of the industry
     * @type {Array<DataPointDto>}
     * @memberof IndustryListItemDto
     */
    trend: Array<DataPointDto>;
}

/**
 * Check if a given object implements the IndustryListItemDto interface.
 */
export function instanceOfIndustryListItemDto(value: object): value is IndustryListItemDto {
    if (!('id' in value) || value['id'] === undefined) return false;
    if (!('name' in value) || value['name'] === undefined) return false;
    if (!('count' in value) || value['count'] === undefined) return false;
    if (!('trend' in value) || value['trend'] === undefined) return false;
    return true;
}

export function IndustryListItemDtoFromJSON(json: any): IndustryListItemDto {
    return IndustryListItemDtoFromJSONTyped(json, false);
}

export function IndustryListItemDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): IndustryListItemDto {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'name': json['name'],
        'count': json['count'],
        'trend': ((json['trend'] as Array<any>).map(DataPointDtoFromJSON)),
    };
}

export function IndustryListItemDtoToJSON(json: any): IndustryListItemDto {
    return IndustryListItemDtoToJSONTyped(json, false);
}

export function IndustryListItemDtoToJSONTyped(value?: IndustryListItemDto | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'name': value['name'],
        'count': value['count'],
        'trend': ((value['trend'] as Array<any>).map(DataPointDtoToJSON)),
    };
}

