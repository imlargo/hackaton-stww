<script lang="ts">
	import { page } from '$app/state';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import type { User } from '$lib/types/auth/user';
	import {
		NAVIGATION_ITEMS,
		NAVIGATION_GROUP_LABELS,
		NavigationGroup,
		ROLE_LABELS
	} from '$lib/config';
	import { UserRole } from '$lib/types/auth/roles';
	import { hasAnyPermission } from '$lib/features/auth';
	import NavMain from './nav-main.svelte';
	import NavSecondary from './nav-secondary.svelte';
	import NavUser from './nav-user.svelte';

	const sidebar = Sidebar.useSidebar();

	let {
		user,
		...restProps
	}: {
		user: User | null;
	} & Omit<ComponentProps<typeof Sidebar.Root>, 'children'> = $props();

	let currentRole = $derived(user?.role ?? UserRole.MEMBER);

	let visibleItems = $derived(
		NAVIGATION_ITEMS.filter((item) => hasAnyPermission(currentRole, item.requiredPermissions))
	);

	const GROUP_ORDER = [NavigationGroup.Main, NavigationGroup.Plataforma, NavigationGroup.Admin];

	let navMainGroups = $derived.by(() =>
		GROUP_ORDER.map((group) => ({
			label: NAVIGATION_GROUP_LABELS[group],
			items: visibleItems
				.filter((item) => item.group === group)
				.map((item) => ({ title: item.title, icon: item.icon, url: item.to }))
		})).filter((group) => group.items.length > 0)
	);

	let displayUser = $derived({
		name: user?.name ?? user?.email ?? 'User',
		email: user?.email ?? '',
		roleLabel: user?.role ? (ROLE_LABELS[user.role] ?? user.role) : '',
		avatar: user?.avatar ?? null
	});

	// Close mobile sidebar on navigation
	let previousPathname = $state(page.url.pathname);
	$effect(() => {
		const nextPathname = page.url.pathname;
		if (nextPathname !== previousPathname) {
			previousPathname = nextPathname;
			if (sidebar.isMobile && sidebar.openMobile) {
				sidebar.setOpenMobile(false);
			}
		}
	});
</script>

<Sidebar.Root collapsible="icon" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton
					size="lg"
					tooltipContent="Home"
					class="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-0"
				>
					{#snippet child({ props })}
						<a href="/" {...props}>
							<div class="flex aspect-square size-10 items-center justify-center">
								<img src="/logo.png" alt="Mi primera minigranja" class="size-10 object-contain" />
							</div>
							<div class="grid flex-1 text-start text-sm leading-tight">
								<span class="truncate font-space-grotesk font-semibold">Mi primera minigranja</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		<NavMain groups={navMainGroups} />
	</Sidebar.Content>

	<Sidebar.Footer>
		<NavUser user={displayUser} />
	</Sidebar.Footer>

	<Sidebar.Rail />
</Sidebar.Root>
