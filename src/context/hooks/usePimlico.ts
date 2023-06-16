import { useContext } from 'react';
import { GlobalContext } from '..';

const usePimlico = () => {
    const { pimlico } = useContext(GlobalContext);
    return {
        pimlico,
    };
};

export default usePimlico;
