'use client';
import React, { Suspense } from 'react';
import { ConvexProvider, ConvexReactClient } from "convex/react";
import AuthProvider from './AuthProvider';

function Provider({ children }) {
  console.log("Provider rendered");

  // make sure you have a proper env variable set
  const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ConvexProvider client={convex}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ConvexProvider>
    </Suspense>
  );
}

export default Provider;
