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
 * @interface UpdateSeniorityLevelDto
 */
export interface UpdateSeniorityLevelDto {
    /**
     * The new seniority level
     * @type {string}
     * @memberof UpdateSeniorityLevelDto
     */
    seniorityLevel: UpdateSeniorityLevelDtoSeniorityLevelEnum;
}


/**
 * @export
 */
export const UpdateSeniorityLevelDtoSeniorityLevelEnum = {
    Intern: 'INTERN',
    EntryLevel: 'ENTRY_LEVEL',
    Associate: 'ASSOCIATE',
    MidSeniorLevel: 'MID_SENIOR_LEVEL',
    Director: 'DIRECTOR',
    Executive: 'EXECUTIVE',
    CLevel: 'C_LEVEL'
} as const;
export type UpdateSeniorityLevelDtoSeniorityLevelEnum = typeof UpdateSeniorityLevelDtoSeniorityLevelEnum[keyof typeof UpdateSeniorityLevelDtoSeniorityLevelEnum];


/**
 * Check if a given object implements the UpdateSeniorityLevelDto interface.
 */
export function instanceOfUpdateSeniorityLevelDto(value: object): value is UpdateSeniorityLevelDto {
    if (!('seniorityLevel' in value) || value['seniorityLevel'] === undefined) return false;
    return true;
}

export function UpdateSeniorityLevelDtoFromJSON(json: any): UpdateSeniorityLevelDto {
    return UpdateSeniorityLevelDtoFromJSONTyped(json, false);
}

export function UpdateSeniorityLevelDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): UpdateSeniorityLevelDto {
    if (json == null) {
        return json;
    }
    return {
        
        'seniorityLevel': json['seniorityLevel'],
    };
}

export function UpdateSeniorityLevelDtoToJSON(json: any): UpdateSeniorityLevelDto {
    return UpdateSeniorityLevelDtoToJSONTyped(json, false);
}

export function UpdateSeniorityLevelDtoToJSONTyped(value?: UpdateSeniorityLevelDto | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'seniorityLevel': value['seniorityLevel'],
    };
}

