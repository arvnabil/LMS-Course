import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export default function ThemeStyleInjector() {
    const { global_settings } = usePage().props;

    useEffect(() => {
        if (!global_settings) return;

        const root = document.documentElement;

        if (global_settings.primary_color) {
            root.style.setProperty('--brand-primary', global_settings.primary_color);
            // Also update hover calculation (roughly 10% darker)
            root.style.setProperty('--brand-primary-hover', global_settings.primary_color + 'dd');
        }

        if (global_settings.sidebar_active_color) {
            root.style.setProperty('--brand-sidebar-active', global_settings.sidebar_active_color);
        }

    }, [global_settings]);

    return null;
}
