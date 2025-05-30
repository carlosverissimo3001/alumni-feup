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
 * @interface CompanyOptionsDto
 */
export interface CompanyOptionsDto {
    /**
     * 
     * @type {string}
     * @memberof CompanyOptionsDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof CompanyOptionsDto
     */
    name: string;
}

/**
 * Check if a given object implements the CompanyOptionsDto interface.
 */
export function instanceOfCompanyOptionsDto(value: object): value is CompanyOptionsDto {
    if (!('id' in value) || value['id'] === undefined) return false;
    if (!('name' in value) || value['name'] === undefined) return false;
    return true;
}

export function CompanyOptionsDtoFromJSON(json: any): CompanyOptionsDto {
    return CompanyOptionsDtoFromJSONTyped(json, false);
}

export function CompanyOptionsDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): CompanyOptionsDto {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'name': json['name'],
    };
}

export function CompanyOptionsDtoToJSON(json: any): CompanyOptionsDto {
    return CompanyOptionsDtoToJSONTyped(json, false);
}

export function CompanyOptionsDtoToJSONTyped(value?: CompanyOptionsDto | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'name': value['name'],
    };
}

