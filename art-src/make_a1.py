# Builds assets/images/A1.png: Dhruv's photo face (oval crop) on a drawn cartoon body.
from PIL import Image, ImageDraw, ImageFilter
import os
here = os.path.dirname(__file__)
src = Image.open(os.path.join(here, 'dhruv.jpg')).convert('RGBA')

# 1) Oval crop around face + hair
box = (15, 330, 605, 975)  # left, top, right, bottom in the photo
face = src.crop(box)
mask = Image.new('L', face.size, 0)
ImageDraw.Draw(mask).ellipse((0, 0, face.size[0] - 1, face.size[1] - 1), fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(3))
# remove green leaves: pixels clearly greener than red become transparent
px = face.load()
for y in range(face.size[1]):
    for x in range(face.size[0]):
        r, g, b, _ = px[x, y]
        if g > r + 8 and g >= b:
            mask.putpixel((x, y), 0)
mask = mask.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1))
face.putalpha(mask)

# 2) Canvas at 3x the in-game size (32x48 -> 96x144)
W, H = 96, 144
img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
KURTA, KURTA_D = (126, 224, 190), (88, 178, 148)
PANTS, SHOE, SKIN = (40, 48, 80), (30, 30, 30), (214, 160, 125)

# legs + shoes
d.rectangle((34, 116, 45, 136), fill=PANTS); d.rectangle((51, 116, 62, 136), fill=PANTS)
d.rounded_rectangle((32, 134, 48, 143), 3, fill=SHOE); d.rounded_rectangle((49, 134, 66, 143), 3, fill=SHOE)
# kurta body (long tunic)
d.rounded_rectangle((26, 76, 70, 122), 8, fill=KURTA, outline=KURTA_D, width=2)
d.line((48, 80, 48, 100), fill=KURTA_D, width=2)
for y in (86, 93, 100): d.ellipse((46, y, 50, y + 4), fill=(240, 250, 245))
# arms + hands
d.rounded_rectangle((16, 80, 28, 110), 5, fill=KURTA, outline=KURTA_D, width=2)
d.rounded_rectangle((68, 80, 80, 110), 5, fill=KURTA, outline=KURTA_D, width=2)
d.ellipse((16, 106, 28, 117), fill=SKIN); d.ellipse((68, 106, 80, 117), fill=SKIN)

# 3) Big head on top (cartoon big-head style)
head = face.resize((86, 94), Image.LANCZOS)
img.alpha_composite(head, (5, 0))

out = os.path.join(here, '..', 'assets', 'images', 'A1.png')
img.save(out)
img.resize((W * 3, H * 3), Image.NEAREST).save(os.path.join(here, 'A1_preview.png'))
print('saved', out)
