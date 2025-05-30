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
import type { CompanyListItemDto } from './CompanyListItemDto';
import {
    CompanyListItemDtoFromJSON,
    CompanyListItemDtoFromJSONTyped,
    CompanyListItemDtoToJSON,
    CompanyListItemDtoToJSONTyped,
} from './CompanyListItemDto';

/**
 * 
 * @export
 * @interface CompanyListResponseDto
 */
export interface CompanyListResponseDto {
    /**
     * 
     * @type {Array<CompanyListItemDto>}
     * @memberof CompanyListResponseDto
     */
    companies: Array<CompanyListItemDto>;
    /**
     * The total number of companies in the database, after applying the filters
     * @type {number}
     * @memberof CompanyListResponseDto
     */
    companyCount: number;
    /**
     * The total number of alumni in the database, after applying the filters
     * @type {number}
     * @memberof CompanyListResponseDto
     */
    alumniCount: number;
}

/**
 * Check if a given object implements the CompanyListResponseDto interface.
 */
export function instanceOfCompanyListResponseDto(value: object): value is CompanyListResponseDto {
    if (!('companies' in value) || value['companies'] === undefined) return false;
    if (!('companyCount' in value) || value['companyCount'] === undefined) return false;
    if (!('alumniCount' in value) || value['alumniCount'] === undefined) return false;
    return true;
}

export function CompanyListResponseDtoFromJSON(json: any): CompanyListResponseDto {
    return CompanyListResponseDtoFromJSONTyped(json, false);
}

export function CompanyListResponseDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): CompanyListResponseDto {
    if (json == null) {
        return json;
    }
    return {
        
        'companies': ((json['companies'] as Array<any>).map(CompanyListItemDtoFromJSON)),
        'companyCount': json['companyCount'],
        'alumniCount': json['alumniCount'],
    };
}

export function CompanyListResponseDtoToJSON(json: any): CompanyListResponseDto {
    return CompanyListResponseDtoToJSONTyped(json, false);
}

export function CompanyListResponseDtoToJSONTyped(value?: CompanyListResponseDto | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'companies': ((value['companies'] as Array<any>).map(CompanyListItemDtoToJSON)),
        'companyCount': value['companyCount'],
        'alumniCount': value['alumniCount'],
    };
}

