/**
 * 
 * @export
 * @interface CreateReviewDto
 */
export interface CreateReviewDto {
    /**
     * The full name of the user
     * @type {string}
     * @memberof CreateReviewDto
     */
    alumniId: string;
    /**
     * The full name of the user
     * @type {string}
     * @memberof CreateReviewDto
     */
    description: string;
    /**
     * The personal email of the user
     * @type {number}
     * @memberof CreateReviewDto
     */
    rating: number;
    /**
     * The full name of the user
     * @type {string}
     * @memberof CreateReviewDto
     */
    reviewType: string;
    /**
     * The full name of the user
     * @type {string}
     * @memberof CreateReviewDto
     */
    companyId: string;
    /**
     * The full name of the user
     * @type {string}
     * @memberof CreateReviewDto
     */
    locationId: string;
}

export function CreateReviewDtoToJSON(json: any): CreateReviewDto {
    return CreateReviewDtoToJSONTyped(json, false);
}

export function CreateReviewDtoToJSONTyped(value?: CreateReviewDto | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }
    return {
        'alumniId': value['alumniId'],
        'description': value['description'],
        'rating': value['rating'],
        'reviewType': value['reviewType'],
        'companyId': value['companyId'],
        'locationId': value['locationId'],
    };
}

