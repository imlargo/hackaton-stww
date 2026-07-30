import HomeIcon from '@lucide/svelte/icons/house';
import SettingsIcon from '@lucide/svelte/icons/settings';
import ShieldIcon from '@lucide/svelte/icons/shield';
import SchoolIcon from '@lucide/svelte/icons/school';
import SproutIcon from '@lucide/svelte/icons/sprout';
import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
import Building2Icon from '@lucide/svelte/icons/building-2';
import CalendarCheckIcon from '@lucide/svelte/icons/calendar-check';
import { PermissionKey } from './permissions';

export enum NavigationGroup {
	Main = 'main',
	Plataforma = 'plataforma',
	Admin = 'admin'
}

export interface NavigationItem {
	title: string;
	// Lucide icon component — typed as `any` to avoid per-icon import generics
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	icon: any;
	to: string;
	group: NavigationGroup;
	requiredPermissions: PermissionKey[];
}

// ─── Navigation items ─────────────────────────────────────────────────────────
// Add/remove items here. The sidebar and site-header derive from this list.
export const NAVIGATION_ITEMS: NavigationItem[] = [
	{
		title: 'Dashboard',
		icon: HomeIcon,
		to: '/',
		group: NavigationGroup.Main,
		requiredPermissions: [PermissionKey.Dashboard]
	},
	{
		title: 'Settings',
		icon: SettingsIcon,
		to: '/settings',
		group: NavigationGroup.Main,
		requiredPermissions: [PermissionKey.Settings]
	},
	{
		title: 'Colegio',
		icon: SchoolIcon,
		to: '/colegio',
		group: NavigationGroup.Plataforma,
		requiredPermissions: [PermissionKey.Colegio]
	},
	{
		title: 'Caracterización',
		icon: SproutIcon,
		to: '/caracterizacion',
		group: NavigationGroup.Plataforma,
		requiredPermissions: [PermissionKey.Caracterizacion]
	},
	{
		title: 'Estudiante',
		icon: GraduationCapIcon,
		to: '/estudiante',
		group: NavigationGroup.Plataforma,
		requiredPermissions: [PermissionKey.Estudiante]
	},
	{
		title: 'Unergy',
		icon: Building2Icon,
		to: '/unergy',
		group: NavigationGroup.Plataforma,
		requiredPermissions: [PermissionKey.Unergy]
	},
	{
		title: 'Visitas',
		icon: CalendarCheckIcon,
		to: '/visitas',
		group: NavigationGroup.Plataforma,
		requiredPermissions: [PermissionKey.Visitas]
	},
	{
		title: 'Admin',
		icon: ShieldIcon,
		to: '/admin',
		group: NavigationGroup.Admin,
		requiredPermissions: [PermissionKey.Admin]
	}
];

export const NAVIGATION_GROUP_LABELS: Record<NavigationGroup, string> = {
	[NavigationGroup.Main]: 'Main',
	[NavigationGroup.Plataforma]: 'Plataforma',
	[NavigationGroup.Admin]: 'Administration'
};
