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


import * as runtime from '../runtime';

/**
 * SystemApi - interface
 * 
 * @export
 * @interface SystemApiInterface
 */
export interface SystemApiInterface {
    /**
     * 
     * @summary Health check
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SystemApiInterface
     */
    appControllerGetHealthRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;

    /**
     * Health check
     */
    appControllerGetHealth(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;

}

/**
 * 
 */
export class SystemApi extends runtime.BaseAPI implements SystemApiInterface {

    /**
     * Health check
     */
    async appControllerGetHealthRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/health`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Health check
     */
    async appControllerGetHealth(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.appControllerGetHealthRaw(initOverrides);
    }

}
