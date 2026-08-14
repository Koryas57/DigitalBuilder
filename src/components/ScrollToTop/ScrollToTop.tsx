import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { resetDocumentScroll } from '../../utils/scrollPosition';

const ScrollToTop: React.FC = () => {
    const { pathname, search, hash } = useLocation();

    useEffect(() => {
        const previousRestoration = window.history.scrollRestoration;
        window.history.scrollRestoration = 'manual';

        return () => {
            window.history.scrollRestoration = previousRestoration;
        };
    }, []);

    useLayoutEffect(() => {
        if (hash) return;
        resetDocumentScroll();
    }, [pathname, search, hash]);

    return null;
};

export default ScrollToTop;
