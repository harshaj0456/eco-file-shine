import os
import shutil

base_dir = os.path.dirname(os.path.abspath(__file__))
output_public = os.path.join(base_dir, ".output", "public")
dist_dir = os.path.join(base_dir, "dist")

if not os.path.exists(output_public):
    raise SystemExit("ERROR: .output/public not found. Run `npm run build` first.")

if os.path.exists(dist_dir):
    shutil.rmtree(dist_dir)
shutil.copytree(output_public, dist_dir)

shell = os.path.join(dist_dir, "_shell.html")
index = os.path.join(dist_dir, "index.html")
if not os.path.exists(shell):
    raise SystemExit("ERROR: _shell.html missing. Is spa enabled in vite.config.ts?")
shutil.copyfile(shell, index)
print("dist/index.html created from _shell.html")