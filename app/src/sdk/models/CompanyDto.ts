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
 * @interface CompanyDto
 */
export interface CompanyDto {
    /**
     * 
     * @type {string}
     * @memberof CompanyDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof CompanyDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof CompanyDto
     */
    industry: string;
    /**
     * 
     * @type {string}
     * @memberof CompanyDto
     */
    website?: string;
    /**
     * 
     * @type {string}
     * @memberof CompanyDto
     */
    linkedinUrl?: string;
    /**
     * 
     * @type {string}
     * @memberof CompanyDto
     */
    logo?: string;
}

/**
 * Check if a given object implements the CompanyDto interface.
 */
export function instanceOfCompanyDto(value: object): value is CompanyDto {
    if (!('id' in value) || value['id'] === undefined) return false;
    if (!('name' in value) || value['name'] === undefined) return false;
    if (!('industry' in value) || value['industry'] === undefined) return false;
    return true;
}

export function CompanyDtoFromJSON(json: any): CompanyDto {
    return CompanyDtoFromJSONTyped(json, false);
}

export function CompanyDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): CompanyDto {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'name': json['name'],
        'industry': json['industry'],
        'website': json['website'] == null ? undefined : json['website'],
        'linkedinUrl': json['linkedinUrl'] == null ? undefined : json['linkedinUrl'],
        'logo': json['logo'] == null ? undefined : json['logo'],
    };
}

export function CompanyDtoToJSON(json: any): CompanyDto {
    return CompanyDtoToJSONTyped(json, false);
}

export function CompanyDtoToJSONTyped(value?: CompanyDto | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'name': value['name'],
        'industry': value['industry'],
        'website': value['website'],
        'linkedinUrl': value['linkedinUrl'],
        'logo': value['logo'],
    };
}

