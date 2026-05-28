"use client";

import { clientNavItems } from '@/config/client-navigation';
import { Bell, ChevronDown, Clock3, Compass, Download, History, LogOut, Moon, Play, Search, Settings, Star, User } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, NavigationMenuViewport } from '../ui/navigation-menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { LogoutButton } from '@/components/auth/logout-button';

const HeaderSidebar = () => {
  return (
    <header className="flex h-16 flex-1 items-center justify-between border-b border-slate-100 bg-white px-12">
      <div className='flex gap-2 items-center '>
        <div className="w-12 h-8 bg-red-600 flex items-center justify-center">
          <Star
            fill="#facc15"
            color="#facc15"
            strokeWidth={1.5}
            className="w-5 h-5"
          />
        </div>
        {/* <h1 className="text-[17px] font-extrabold tracking-tight text-slate-900">Tea</h1> */}
      </div>
      <NavigationMenu>
        <NavigationMenuList className="gap-8">
          {clientNavItems.map((item: any) => {
            const Icon = item?.icon;
            const hasChildren = item.children?.length;

            if (hasChildren) {
              return (
                <NavigationMenuItem key={item.title}>
                  <NavigationMenuTrigger className="bg-transparent">
                    <div className="flex items-center gap-2">
                      <span>{item.title}</span>
                    </div>
                  </NavigationMenuTrigger>

                  <NavigationMenuContent>
                    <div className="w-[200px]">
                      <div className="space-y-1">
                        {item.children?.map((child: any) => {
                          const ChildIcon = child.icon;

                          return (
                            <NavigationMenuLink asChild key={child.href}>
                              <Link
                                href={child.href}
                                className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-100"
                              >
                                {ChildIcon && (
                                  <ChildIcon
                                    size={18}
                                    className="text-slate-500"
                                  />
                                )}

                                <div>
                                  <p className="font-semibold text-slate-800">
                                    {child.name}
                                  </p>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          );
                        })}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              );
            }

            return (
              <NavigationMenuItem key={item.title}>
                <Link
                  href={item.href}
                  className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100 hover:text-purple-600"
                >
                  <div className="flex items-center gap-2">
                    {Icon && <Icon size={18} />}
                    <span>{item.title}</span>
                  </div>
                </Link>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
        <NavigationMenuViewport />
      </NavigationMenu>

      <div className="flex items-center gap-4">
        <button className="grid h-10 w-10 place-items-center rounded-full text-slate-900 transition hover:bg-slate-50" aria-label="Search">
          <Search size={24} strokeWidth={2.2} />
        </button>

        <button className="relative grid h-10 w-10 place-items-center rounded-full text-slate-700 transition hover:bg-slate-50" aria-label="Notifications">
          <Bell size={23} strokeWidth={2.1} />
          <span className="absolute right-0.5 top-1 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">3</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full px-1 py-1 transition hover:bg-slate-100">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-[12px] font-bold text-slate-500 shadow-inner">
                U
              </span>

              <ChevronDown
                size={17}
                strokeWidth={2.4}
                className="text-slate-500"
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 rounded-xl border border-slate-200 p-2"
          >
            {/* PROFILE */}
            <DropdownMenuItem asChild>
              <Link
                href="/profile"
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2"
              >
                <User size={18} className="text-slate-500" />

                <div className="flex flex-col">
                  <span className="font-medium">Profile</span>
                  <span className="text-xs text-slate-500">
                    Manage your account
                  </span>
                </div>
              </Link>
            </DropdownMenuItem>

            {/* SETTINGS */}
            <DropdownMenuItem asChild>
              <Link
                href="/settings"
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2"
              >
                <Settings size={18} className="text-slate-500" />

                <div className="flex flex-col">
                  <span className="font-medium">Settings</span>
                  <span className="text-xs text-slate-500">
                    Preferences & privacy
                  </span>
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* LOGOUT */}
            <DropdownMenuItem asChild>
              <LogoutButton
                redirectTo="/login"
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-red-500 outline-none"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </LogoutButton>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default HeaderSidebar
