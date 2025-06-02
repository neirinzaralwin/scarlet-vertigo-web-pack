'use client';

import * as React from 'react';
import { AudioWaveform, BookOpen, Bot, Command, Frame, GalleryVerticalEnd, Map, PieChart, Settings2, SquareTerminal } from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavProjects } from '@/components/nav-projects';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';

// This is sample data.
const data = {
    user: {
        name: 'shadcn',
        email: 'm@example.com',
        avatar: '/avatars/shadcn.jpg',
    },
    teams: [
        {
            name: 'Scarlet Vertigo',
            logo: GalleryVerticalEnd,
            plan: 'Ecommerce',
        },
    ],
    navMain: [
        {
            title: 'Dashboard',
            url: '/dashboard',
            icon: SquareTerminal,
            isActive: true,
            items: [
                {
                    title: 'Overview',
                    url: '/dashboard',
                },
            ],
        },

        {
            title: 'Settings',
            url: '/settings',
            icon: Settings2,
            items: [
                {
                    title: 'General',
                    url: '/settings',
                },
            ],
        },
    ],
    projects: [
        {
            name: 'Design Engineering',
            url: '/projects/design-engineering',
            icon: Frame,
        },
        {
            name: 'Sales & Marketing',
            url: '/projects/sales-marketing',
            icon: PieChart,
        },
        {
            name: 'Travel',
            url: '/projects/travel',
            icon: Map,
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={data.teams} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavProjects projects={data.projects} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
