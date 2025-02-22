import { NextResponse } from "next/server";

const API_KEY = process.env.TENOR_API_KEY;

export async function GET(request: Request) {
  try {
    if (!API_KEY) {
      throw new Error("TENOR_API_KEY environment variable is not set");
    }

    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("q");

    if (!searchTerm) {
      return NextResponse.json(
        { error: "Search term is required" },
        { status: 400 },
      );
    }

    const randomOffset = Math.floor(Math.random() * 10);

    const response = await fetch(
      `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(
        searchTerm,
      )}&key=${API_KEY}&client_key=my_app&limit=1&pos=${randomOffset}&random=true&media_filter=gif`,
      {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`Tenor API error: ${response.statusText}`);
    }

    const data = await response.json();
    const gif = data.results[0]?.media_formats.gif.url;

    if (!gif) {
      throw new Error("No GIF found");
    }

    return new NextResponse(JSON.stringify({ gif }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error fetching GIF:", error);
    return NextResponse.json(
      { error: "Failed to fetch GIF" },
      {
        status: 500,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  }
}
