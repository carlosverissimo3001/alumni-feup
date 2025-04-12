import { AxiosError } from 'axios';

export const getErrorMessage = (error: Error | null) => {
    if (!error) return undefined;
    
    const axiosError = error as AxiosError<{message?: string}>;
    if (axiosError.response?.data?.message) {
        const errMsg = axiosError.response.data.message;
        
        // Can be an array of errors (Validation errors)
        if (Array.isArray(errMsg)) {
            return errMsg.join('\n');
        }

        return errMsg;
    }
    
    return error.message || 'Unknown error';
  };