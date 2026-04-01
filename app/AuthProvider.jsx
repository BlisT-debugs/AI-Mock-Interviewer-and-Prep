'use client';
import { api } from '@/convex/_generated/api';
import { useUser } from '@stackframe/stack';
import { useMutation } from 'convex/react';
import React, { useEffect } from 'react';

function AuthProvider({ children }) {
    const user = useUser();
    const createUser = useMutation(api.users.CreateUser);

    useEffect(() => {
        if (user?.primaryEmail && user?.displayName) {
            createUser({
                email: user.primaryEmail,
                name: user.displayName
            });
        }
    }, [user, createUser]);

    return <div>{children}</div>;
}

export default AuthProvider;