import { 
    ArrowBigRightDash,
    BadgePercent,
    CalendarCheck2,
    Clapperboard,
    Rose,
    Store,
    TvMinimalPlay,
} from "lucide-react";

export const clientNavItems = [
    {
        title: "Schedule",
        href: "/",
        // icon: CalendarCheck2,
        children: [
            {
                name: "Now Showing", 
                href: "/movies",
                icon: Clapperboard,
            },
            {
                name: "Coming Soon", 
                href: "/soon",
                icon: ArrowBigRightDash,
            },
            {
                name: "Special Screenings", 
                href: "/specials",
                icon: Rose,
            },
            {
                name: "Cinemas", 
                href: "/cinemas",
                icon: TvMinimalPlay,
            },
        ]
    },
    {
        title: "About",
        href: "/about",
        // icon: Store,
    },
    {
        title: "Price",
        href: "/price",
        // icon: BadgePercent,
    }

]