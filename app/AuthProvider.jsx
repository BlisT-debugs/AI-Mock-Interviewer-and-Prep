'use client';
import { api } from '@/convex/_generated/api';
import { useUser } from '@stackframe/stack';
import { useMutation } from 'convex/react';
import React, { useEffect } from 'react';

function AuthProvider({ children }) {
    const user = useUser();
    const createUser = useMutation(api.users.CreateUser);

    useEffect(() => {
        console.log("user", user);
        if (user?.primaryEmail && user?.displayName) {
            createUser({
                email: user.primaryEmail,
                name: user.displayName
            }).then(res => {
                console.log("User created:", res);
            }).catch(err => {
                console.log("Error creating user:", err);
            });
        }
    }, [user, createUser]);

    return <div>{children}</div>;
}

export default AuthProvider;