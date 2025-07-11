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
import type { GraduationListItemDto } from './GraduationListItemDto';
import {
    GraduationListItemDtoFromJSON,
    GraduationListItemDtoFromJSONTyped,
    GraduationListItemDtoToJSON,
    GraduationListItemDtoToJSONTyped,
} from './GraduationListItemDto';

/**
 * 
 * @export
 * @interface GraduationListDto
 */
export interface GraduationListDto {
    /**
     * The graduation list
     * @type {Array<GraduationListItemDto>}
     * @memberof GraduationListDto
     */
    graduations: Array<GraduationListItemDto>;
    /**
     * The number of cohorts, after applying the filters
     * @type {number}
     * @memberof GraduationListDto
     */
    count: number;
}

/**
 * Check if a given object implements the GraduationListDto interface.
 */
export function instanceOfGraduationListDto(value: object): value is GraduationListDto {
    if (!('graduations' in value) || value['graduations'] === undefined) return false;
    if (!('count' in value) || value['count'] === undefined) return false;
    return true;
}

export function GraduationListDtoFromJSON(json: any): GraduationListDto {
    return GraduationListDtoFromJSONTyped(json, false);
}

export function GraduationListDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): GraduationListDto {
    if (json == null) {
        return json;
    }
    return {
        
        'graduations': ((json['graduations'] as Array<any>).map(GraduationListItemDtoFromJSON)),
        'count': json['count'],
    };
}

export function GraduationListDtoToJSON(json: any): GraduationListDto {
    return GraduationListDtoToJSONTyped(json, false);
}

export function GraduationListDtoToJSONTyped(value?: GraduationListDto | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'graduations': ((value['graduations'] as Array<any>).map(GraduationListItemDtoToJSON)),
        'count': value['count'],
    };
}

