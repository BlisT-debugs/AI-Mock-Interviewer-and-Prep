// app/api/token/route.js
import { AssemblyAI } from "assemblyai";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verify API key is loaded
    if (!process.env.ASSEMBLY_API_KEY) {
      console.error("AssemblyAI API key is missing");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const assemblyai = new AssemblyAI({
      apiKey: process.env.ASSEMBLY_API_KEY
    });

    const token = await assemblyai.realtime.createTemporaryToken({
      expires_in: 3600
    });

    console.log("Successfully generated token"); // Debug log
    return NextResponse.json({ token });

  } catch (error) {
    console.error("Detailed error:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    return NextResponse.json(
      { error: "Failed to generate token", details: error.message },
      { status: 500 }
    );
  }
}