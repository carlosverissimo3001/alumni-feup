import { useQuery } from "@tanstack/react-query";
import { useJsonFromResponse } from "@/commom";
import NestAPI from "@/api";
import { CourseExtended as Course, CourseControllerFindStatusEnum } from "@/sdk";

const arrangeCourses = (courses: Course[]) => {
    // Note: We need to do this in the FE because we can't store dots(.) in the database
    const coursesReplaced = courses.map(course => ({
        ...course,
        acronym: course.acronym.replace('_', '.')
    }));

    return coursesReplaced.sort((a, b) => a.name.localeCompare(b.name));
}

type UseListCoursesParams = {
    facultyId?: string;
    name?: string;
    status?: CourseControllerFindStatusEnum;
    enabled: boolean;
}

export const useListCourses = ({facultyId, name, status, enabled}: UseListCoursesParams) => {
    const query = useQuery({
        queryKey: ['courses', facultyId],
        queryFn: () => NestAPI.courseControllerFind({facultyId, status, name})
            .then(arrangeCourses),
        staleTime: Infinity, // Data will never become stale automatically
        gcTime: Infinity, // Cache will never be cleared automatically (formerly cacheTime)
        refetchOnMount: false, // Don't refetch when component mounts
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        enabled: enabled,
    });

    const parsedError = useJsonFromResponse<{error?: string}>((query.error as unknown) as Response | undefined);
    const errorFromResponse = query.error instanceof Response ? parsedError?.error : undefined;
    const unknownError = query.error ? 'Unknown error' : undefined;
    const error = errorFromResponse || (query.error as Error)?.message || unknownError;

    return {
        data: query.data,
        isLoading: query.isLoading,
        error,
        refetch: query.refetch
    };
}