# Builds assets/images/A1.png (spritesheet) from art-src/dhruv_sheet.webp:
# removes white background + shadows, slices frames, enlarges the head (HEAD_SCALE).
# Frame order: idle 0-2, run 3-6, jump 7-9.
import os, json
import numpy as np
from PIL import Image
from scipy import ndimage

HEAD_SCALE = 1.6
here = os.path.dirname(os.path.abspath(__file__))
im = np.array(Image.open(os.path.join(here, 'dhruv_sheet.webp')).convert('RGB')).astype(int)
H, W, _ = im.shape
r, g, b = im[..., 0], im[..., 1], im[..., 2]
mx, mn = im.max(-1), im.min(-1)
# background = light & low-saturation (white + grey shadow), connected to the border
bgish = (mn > 150) & (mx - mn < 30)
lab, _ = ndimage.label(bgish)
border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bg = np.isin(lab, list(border))
fg = ~bg
fg[:, :270] = False                       # drop the IDLE/RUNNING/JUMPING labels
fg = ndimage.binary_opening(fg, iterations=1)

lab, n = ndimage.label(ndimage.binary_dilation(fg, iterations=6))
boxes = [s for s in ndimage.find_objects(lab) if (s[0].stop - s[0].start) > 120]
# sort by row band then x
boxes.sort(key=lambda s: (round(s[0].start / 300), s[1].start))
assert len(boxes) == 10, len(boxes)

rgba = np.dstack([im, np.where(fg, 255, 0)]).astype(np.uint8)
shirt = (g > 170) & (g > r + 40) & (b > 120)   # mint shirt color
frames = []
for sy, sx in boxes:
    crop = Image.fromarray(rgba[sy, sx])
    a = np.array(crop)
    sh = shirt[sy, sx] & (a[..., 3] > 0)
    cw = sh.shape[1]; mid = sh[:, int(cw * 0.35):int(cw * 0.65)]  # center only, ignores raised arms
    rows = np.where(mid.sum(1) > 8)[0]
    neck = rows[0] + 4                     # first row with shirt = bottom of head
    head = crop.crop((0, 0, crop.width, neck))
    ha = np.array(head)
    hl, hn = ndimage.label(ndimage.binary_erosion(ha[..., 3] > 0, iterations=3))
    if hn > 1:  # keep only the head blob (drop raised fists etc.)
        sizes = ndimage.sum(np.ones_like(hl), hl, range(1, hn + 1))
        keep = ndimage.binary_dilation(hl == 1 + int(np.argmax(sizes)), iterations=4)
        ha[..., 3] = np.where(keep, ha[..., 3], 0)
        head = Image.fromarray(ha)
    hb = head.getbbox()
    head = head.crop(hb)
    cx = (hb[0] + hb[2]) / 2
    big = head.resize((int(head.width * HEAD_SCALE), int(head.height * HEAD_SCALE)), Image.LANCZOS)
    body = crop.crop((0, 0, crop.width, crop.height))
    body_off = big.height - (neck - 4)
    w = max(crop.width, big.width) + 8
    out = Image.new('RGBA', (w, body_off + body.height))
    ox = (w - crop.width) // 2
    out.alpha_composite(body, (ox, body_off))
    out.alpha_composite(big, (int(ox + cx - big.width / 2), 8))
    frames.append(out.crop(out.getbbox()))

FW, FH = 96, 128  # cell size in output sheet
fw_src = max(f.width for f in frames); fh_src = max(f.height for f in frames)
scale = min(FW / fw_src, FH / fh_src)
sheet = Image.new('RGBA', (FW * len(frames), FH))
for i, f in enumerate(frames):
    f = f.resize((max(1, int(f.width * scale)), max(1, int(f.height * scale))), Image.LANCZOS)
    sheet.alpha_composite(f, (i * FW + (FW - f.width) // 2, FH - f.height))  # feet on bottom
sheet.save(os.path.join(here, '..', 'assets', 'images', 'A1.png'))
sheet.resize((sheet.width * 2, sheet.height * 2), Image.NEAREST).save(os.path.join(here, 'A1_preview.png'))
print('frames', len(frames), 'cell', FW, FH)
