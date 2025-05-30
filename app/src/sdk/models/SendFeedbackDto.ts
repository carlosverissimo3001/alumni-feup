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
 * @interface SendFeedbackDto
 */
export interface SendFeedbackDto {
    /**
     * The name of the user sending the feedback
     * @type {string}
     * @memberof SendFeedbackDto
     */
    name: string;
    /**
     * The email of the user sending the feedback
     * @type {string}
     * @memberof SendFeedbackDto
     */
    email: string;
    /**
     * The feedback message
     * @type {string}
     * @memberof SendFeedbackDto
     */
    feedback: string;
    /**
     * The type of feedback
     * @type {string}
     * @memberof SendFeedbackDto
     */
    type: SendFeedbackDtoTypeEnum;
}


/**
 * @export
 */
export const SendFeedbackDtoTypeEnum = {
    Bug: 'BUG',
    FeatureRequest: 'FEATURE_REQUEST',
    Other: 'OTHER'
} as const;
export type SendFeedbackDtoTypeEnum = typeof SendFeedbackDtoTypeEnum[keyof typeof SendFeedbackDtoTypeEnum];


/**
 * Check if a given object implements the SendFeedbackDto interface.
 */
export function instanceOfSendFeedbackDto(value: object): value is SendFeedbackDto {
    if (!('name' in value) || value['name'] === undefined) return false;
    if (!('email' in value) || value['email'] === undefined) return false;
    if (!('feedback' in value) || value['feedback'] === undefined) return false;
    if (!('type' in value) || value['type'] === undefined) return false;
    return true;
}

export function SendFeedbackDtoFromJSON(json: any): SendFeedbackDto {
    return SendFeedbackDtoFromJSONTyped(json, false);
}

export function SendFeedbackDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): SendFeedbackDto {
    if (json == null) {
        return json;
    }
    return {
        
        'name': json['name'],
        'email': json['email'],
        'feedback': json['feedback'],
        'type': json['type'],
    };
}

export function SendFeedbackDtoToJSON(json: any): SendFeedbackDto {
    return SendFeedbackDtoToJSONTyped(json, false);
}

export function SendFeedbackDtoToJSONTyped(value?: SendFeedbackDto | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'name': value['name'],
        'email': value['email'],
        'feedback': value['feedback'],
        'type': value['type'],
    };
}

