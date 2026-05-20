import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { spawn } from "child_process";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tmpPath = join(tmpdir(), `color_analysis_${Date.now()}.jpg`);
    await writeFile(tmpPath, buffer);

    const scriptPath = join(process.cwd(), "scripts", "color_analysis.py");

    const output = await new Promise<string>((resolve, reject) => {
      let stdout = "";
      let stderr = "";

      const proc = spawn("python3", [scriptPath, tmpPath]);

      proc.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
      proc.stderr.on("data", (chunk) => { stderr += chunk.toString(); });

      proc.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(stderr || `Script exited with code ${code}`));
        } else {
          resolve(stdout);
        }
      });

      proc.on("error", (err) => reject(err));

      // 60-second timeout
      setTimeout(() => {
        proc.kill();
        reject(new Error("Color analysis timed out after 60 seconds"));
      }, 60_000);
    });

    await unlink(tmpPath).catch(() => {});

    const data = JSON.parse(output.trim());

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
