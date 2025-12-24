export interface Menu {
    main_title?: string;
    title?: string;
    icon?: string;
    path?: string;
    type?: string;
    active?: boolean;
    badge?: boolean;
    badge_value?: string;
    badge_color?: string;
    level?: number;
    bookmark?: boolean;
    children?: Menu[];
    pined?: boolean;
    id?: string;
    // Nuevos campos para sistema de permisos RBAC
    permissions?: string[];        // Permisos requeridos para ver este ítem
    permissionMode?: 'all' | 'any'; // 'all' = todos los permisos, 'any' = al menos uno
    roles?: string[];              // Roles requeridos (alternativa a permisos)
}
