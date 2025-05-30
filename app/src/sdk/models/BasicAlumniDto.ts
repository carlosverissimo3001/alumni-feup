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
 * @interface BasicAlumniDto
 */
export interface BasicAlumniDto {
    /**
     * The id of the alumni
     * @type {string}
     * @memberof BasicAlumniDto
     */
    id: string;
    /**
     * The name of the alumni
     * @type {string}
     * @memberof BasicAlumniDto
     */
    name: string;
    /**
     * The seniority of the role
     * @type {string}
     * @memberof BasicAlumniDto
     */
    seniority: string;
    /**
     * The role start date
     * @type {string}
     * @memberof BasicAlumniDto
     */
    startDate: string;
    /**
     * The role end date, if applicable
     * @type {string}
     * @memberof BasicAlumniDto
     */
    endDate: string;
}

/**
 * Check if a given object implements the BasicAlumniDto interface.
 */
export function instanceOfBasicAlumniDto(value: object): value is BasicAlumniDto {
    if (!('id' in value) || value['id'] === undefined) return false;
    if (!('name' in value) || value['name'] === undefined) return false;
    if (!('seniority' in value) || value['seniority'] === undefined) return false;
    if (!('startDate' in value) || value['startDate'] === undefined) return false;
    if (!('endDate' in value) || value['endDate'] === undefined) return false;
    return true;
}

export function BasicAlumniDtoFromJSON(json: any): BasicAlumniDto {
    return BasicAlumniDtoFromJSONTyped(json, false);
}

export function BasicAlumniDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): BasicAlumniDto {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'name': json['name'],
        'seniority': json['seniority'],
        'startDate': json['startDate'],
        'endDate': json['endDate'],
    };
}

export function BasicAlumniDtoToJSON(json: any): BasicAlumniDto {
    return BasicAlumniDtoToJSONTyped(json, false);
}

export function BasicAlumniDtoToJSONTyped(value?: BasicAlumniDto | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'name': value['name'],
        'seniority': value['seniority'],
        'startDate': value['startDate'],
        'endDate': value['endDate'],
    };
}

