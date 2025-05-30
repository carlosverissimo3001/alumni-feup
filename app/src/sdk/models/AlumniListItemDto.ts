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
import type { LocationAnalyticsEntity } from './LocationAnalyticsEntity';
import {
    LocationAnalyticsEntityFromJSON,
    LocationAnalyticsEntityFromJSONTyped,
    LocationAnalyticsEntityToJSON,
    LocationAnalyticsEntityToJSONTyped,
} from './LocationAnalyticsEntity';

/**
 * 
 * @export
 * @interface AlumniListItemDto
 */
export interface AlumniListItemDto {
    /**
     * The alumni ID
     * @type {string}
     * @memberof AlumniListItemDto
     */
    id: string;
    /**
     * The full name of the alumni
     * @type {string}
     * @memberof AlumniListItemDto
     */
    fullName: string;
    /**
     * The linkedin url of the alumni
     * @type {string}
     * @memberof AlumniListItemDto
     */
    linkedinUrl?: string;
    /**
     * The profile picture of the alumni
     * @type {string}
     * @memberof AlumniListItemDto
     */
    profilePictureUrl?: string;
    /**
     * The location of the alumni`s current role
     * @type {LocationAnalyticsEntity}
     * @memberof AlumniListItemDto
     */
    currentRoleLocation?: LocationAnalyticsEntity;
}

/**
 * Check if a given object implements the AlumniListItemDto interface.
 */
export function instanceOfAlumniListItemDto(value: object): value is AlumniListItemDto {
    if (!('id' in value) || value['id'] === undefined) return false;
    if (!('fullName' in value) || value['fullName'] === undefined) return false;
    return true;
}

export function AlumniListItemDtoFromJSON(json: any): AlumniListItemDto {
    return AlumniListItemDtoFromJSONTyped(json, false);
}

export function AlumniListItemDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): AlumniListItemDto {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'fullName': json['fullName'],
        'linkedinUrl': json['linkedinUrl'] == null ? undefined : json['linkedinUrl'],
        'profilePictureUrl': json['profilePictureUrl'] == null ? undefined : json['profilePictureUrl'],
        'currentRoleLocation': json['currentRoleLocation'] == null ? undefined : LocationAnalyticsEntityFromJSON(json['currentRoleLocation']),
    };
}

export function AlumniListItemDtoToJSON(json: any): AlumniListItemDto {
    return AlumniListItemDtoToJSONTyped(json, false);
}

export function AlumniListItemDtoToJSONTyped(value?: AlumniListItemDto | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'fullName': value['fullName'],
        'linkedinUrl': value['linkedinUrl'],
        'profilePictureUrl': value['profilePictureUrl'],
        'currentRoleLocation': LocationAnalyticsEntityToJSON(value['currentRoleLocation']),
    };
}

