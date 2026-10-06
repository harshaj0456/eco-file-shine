import math
import os
from PIL import Image, ImageDraw, ImageFont

public_dir = os.path.join(os.path.dirname(__file__), "public")
os.makedirs(public_dir, exist_ok=True)

def create_gradient(width, height, start_color, end_color):
    base = Image.new('RGBA', (width, height), start_color)
    top = Image.new('RGBA', (width, height), end_color)
    mask = Image.new('L', (width, height))
    for y in range(height):
        for x in range(width):
            mask.putpixel((x, y), int(255 * (x + y) / (width + height)))
    base.paste(top, (0, 0), mask)
    return base

def draw_leaf_pulse(draw, cx, cy, size, color=(255, 255, 255, 255)):
    # Draw stylized leaf / eco pulse emblem
    r = size // 2
    # Leaf petal
    points = [
        (cx, cy - r),
        (cx + r, cy),
        (cx, cy + r),
        (cx - int(r * 0.4), cy + int(r * 0.4)),
        (cx - r, cy),
        (cx - int(r * 0.4), cy - int(r * 0.4)),
    ]
    draw.polygon(points, fill=color)
    # Inner pulse vein line
    vein_points = [
        (cx - int(r*0.6), cy),
        (cx - int(r*0.2), cy),
        (cx - int(r*0.1), cy - int(r*0.4)),
        (cx + int(r*0.1), cy + int(r*0.4)),
        (cx + int(r*0.2), cy),
        (cx + int(r*0.6), cy),
    ]
    draw.line(vein_points, fill=(16, 185, 129, 255), width=max(2, size // 25))

def create_icon(size, filename):
    img = create_gradient(size, size, (16, 185, 129, 255), (5, 150, 105, 255))
    draw = ImageDraw.Draw(img)
    
    # Rounded corner effect / circle backdrop
    margin = size // 10
    draw.ellipse([margin, margin, size - margin, size - margin], fill=(255, 255, 255, 40))
    draw_leaf_pulse(draw, size // 2, size // 2, int(size * 0.55))
    
    img.save(os.path.join(public_dir, filename), "PNG")
    print(f"Created {filename}")

def create_screenshot(width, height, filename, title, subtitle):
    img = create_gradient(width, height, (15, 23, 42, 255), (10, 15, 30, 255))
    draw = ImageDraw.Draw(img)
    
    # Card mockup
    card_margin = 30
    draw.rounded_rectangle([card_margin, 60, width - card_margin, 220], radius=16, fill=(30, 41, 59, 230), outline=(16, 185, 129, 200), width=2)
    draw_leaf_pulse(draw, width // 2, 120, 60)
    
    # Text headers
    # Metrics card
    draw.rounded_rectangle([card_margin, 250, width - card_margin, 460], radius=16, fill=(30, 41, 59, 200))
    draw.rounded_rectangle([card_margin + 20, 280, width - card_margin - 20, 340], radius=8, fill=(16, 185, 129, 50))
    draw.rounded_rectangle([card_margin + 20, 360, width - card_margin - 20, 420], radius=8, fill=(59, 130, 246, 50))
    
    # Action card
    draw.rounded_rectangle([card_margin, 490, width - card_margin, 660], radius=16, fill=(16, 185, 129, 240))
    
    img.save(os.path.join(public_dir, filename), "PNG")
    print(f"Created {filename}")

create_icon(192, "icon-192.png")
create_icon(512, "icon-512.png")
create_screenshot(540, 720, "screenshot-1.png", "GreenPulse Dashboard", "Real-time Carbon & Storage Analytics")
create_screenshot(540, 720, "screenshot-2.png", "Digital Cleanup Optimizer", "One-tap Storage De-clutter")
print("All PWA assets generated successfully!")
