"use client";

import { UserButton } from "@clerk/nextjs";

export function UserNav() {
    return (
        <UserButton
            appearance={{
                elements: {
                    avatarBox: "w-8 h-8",
                },
            }}
        />
    );
}