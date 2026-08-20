import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

describe("POST /api/parse", () => {
  it("rejects oversized requests before parsing multipart data", async () => {
    const request = new NextRequest("http://localhost/api/parse", {
      method: "POST",
      headers: { "content-length": String(12 * 1024 * 1024) },
    });
    const response = await POST(request);
    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({ error: "The media plan must be smaller than 10 MB." });
  });

  it("aborts oversized streamed bodies without relying on Content-Length", async () => {
    const request = new NextRequest("http://localhost/api/parse", {
      method: "POST",
      headers: { "content-type": "application/octet-stream" },
      body: new Uint8Array(11 * 1024 * 1024 + 1),
    });
    const response = await POST(request);
    expect(response.status).toBe(413);
  });
});
