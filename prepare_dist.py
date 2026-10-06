import os
import shutil
import glob

base_dir = os.path.dirname(__file__)
output_public = os.path.join(base_dir, ".output", "public")
dist_dir = os.path.join(base_dir, "dist")

if os.path.exists(dist_dir):
    shutil.rmtree(dist_dir)

if os.path.exists(output_public):
    shutil.copytree(output_public, dist_dir)
    print("Copied .output/public to dist")
else:
    os.makedirs(dist_dir, exist_ok=True)
    public_dir = os.path.join(base_dir, "public")
    if os.path.exists(public_dir):
        for item in os.listdir(public_dir):
            s = os.path.join(public_dir, item)
            d = os.path.join(dist_dir, item)
            if os.path.isdir(s):
                shutil.copytree(s, d)
            else:
                shutil.copy2(s, d)

# Find CSS and JS assets
css_files = [os.path.basename(f) for f in glob.glob(os.path.join(dist_dir, "assets", "*.css"))]
js_files = [os.path.basename(f) for f in glob.glob(os.path.join(dist_dir, "assets", "app-*.js"))]

css_tags = "\n".join([f'    <link rel="stylesheet" href="./assets/{css}">' for css in css_files])
js_tags = "\n".join([f'    <script type="module" src="./assets/{js}"></script>' for js in js_files])

html_template = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" />
    <meta name="theme-color" content="#10B981" />
    <meta name="description" content="GreenPulse - Personal Digital Carbon & Storage Optimizer" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <title>GreenPulse — Digital Sustainability Dashboard</title>
    <link rel="manifest" href="./manifest.json" />
    <link rel="icon" type="image/x-icon" href="./favicon.ico" />
    <link rel="apple-touch-icon" href="./icon-192.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" />
__CSS_TAGS__
  </head>
  <body class="bg-background text-foreground antialiased min-h-screen">
    <div id="root"></div>
__JS_TAGS__
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('./service-worker.js')
            .then(function(reg) { console.log('SW registered:', reg); })
            .catch(function(err) { console.log('SW registration failed:', err); });
        });
      }
    </script>
  </body>
</html>
"""

index_html_content = html_template.replace("__CSS_TAGS__", css_tags).replace("__JS_TAGS__", js_tags)

with open(os.path.join(dist_dir, "index.html"), "w", encoding="utf-8") as f:
    f.write(index_html_content)

print(f"dist/index.html created successfully with CSS: {css_files} and JS: {js_files}")
