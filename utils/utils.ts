/**
 * Utility functions for handling redirects with encoded messages
 */

import { redirect } from "next/navigation";

/**
 * Creates a redirect with an encoded message in the URL
 * @param type The type of message (success, error, info)
 * @param path The path to redirect to
 * @param message The message to display
 * @returns A redirect response with the encoded message
 */
export function encodedRedirect(
    type: "success" | "error" | "info",
    path: string,
    message: string
  ): string {
    const searchParams = new URLSearchParams();
    searchParams.set("type", type);
    searchParams.set("message", message);
    
    // Retornamos la URL final como string
    return `${path}?${searchParams.toString()}`;
  }