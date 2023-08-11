import { useContext } from 'react';
import { GlobalContext } from '..';

const useAAHelper = () => {
    const { aaHelper } = useContext(GlobalContext);
    return {
        aaHelper,
    };
};

export default useAAHelper;
