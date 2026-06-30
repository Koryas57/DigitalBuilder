import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: React.FC = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0); // Ramène la page en haut
    }, [pathname]); // Exécute à chaque changement de route

    return null; // Ce composant ne rend rien visuellement
};

export default ScrollToTop;
