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
import type { User } from './User';
import {
    UserFromJSON,
    UserFromJSONTyped,
    UserToJSON,
    UserToJSONTyped,
} from './User';

/**
 * 
 * @export
 * @interface UserAuthResponse
 */
export interface UserAuthResponse {
    /**
     * The access token of the user
     * @type {string}
     * @memberof UserAuthResponse
     */
    accessToken?: string | null;
    /**
     * The user object
     * @type {User}
     * @memberof UserAuthResponse
     */
    user?: User | null;
    /**
     * The status of the user
     * @type {string}
     * @memberof UserAuthResponse
     */
    status: UserAuthResponseStatusEnum;
    /**
     * The person ID of the user
     * @type {string}
     * @memberof UserAuthResponse
     */
    personId?: string | null;
}


/**
 * @export
 */
export const UserAuthResponseStatusEnum = {
    Matched: 'MATCHED',
    Unmatched: 'UNMATCHED'
} as const;
export type UserAuthResponseStatusEnum = typeof UserAuthResponseStatusEnum[keyof typeof UserAuthResponseStatusEnum];


/**
 * Check if a given object implements the UserAuthResponse interface.
 */
export function instanceOfUserAuthResponse(value: object): value is UserAuthResponse {
    if (!('status' in value) || value['status'] === undefined) return false;
    return true;
}

export function UserAuthResponseFromJSON(json: any): UserAuthResponse {
    return UserAuthResponseFromJSONTyped(json, false);
}

export function UserAuthResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): UserAuthResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'accessToken': json['access_token'] == null ? undefined : json['access_token'],
        'user': json['user'] == null ? undefined : UserFromJSON(json['user']),
        'status': json['status'],
        'personId': json['personId'] == null ? undefined : json['personId'],
    };
}

export function UserAuthResponseToJSON(json: any): UserAuthResponse {
    return UserAuthResponseToJSONTyped(json, false);
}

export function UserAuthResponseToJSONTyped(value?: UserAuthResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'access_token': value['accessToken'],
        'user': UserToJSON(value['user']),
        'status': value['status'],
        'personId': value['personId'],
    };
}

