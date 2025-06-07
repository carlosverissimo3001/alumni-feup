import { useEffect, useState } from "react";

export const useJsonFromResponse = <T extends Record<string, unknown>>(response?: Response) => {
    const [data, setData] = useState<T | undefined>();

    useEffect(() => {
        if (response) {
            response.json().then(setData);
        }
        else {
            setData(undefined);
        }
    }, [response]);
    return data;
}
