# Wordmark pen path

The droplet entrance reveals the real Pacifico `<h1>` along a pen path
authored on the font's actual outlines. `skeleton.json` is the hand-authored
path per letter in font units (y up); `snap.js` rasterises the glyphs with
fontkit, snaps each point to the centre of its stroke, checks that a brush of
the production radius covers the whole lettering, and regenerates
`src/lib/wordmark-path.js`.

Only needed if the wordmark text or font changes:

```bash
npm i --no-save fontkit && node scripts/wordmark/snap.cjs
```

Coverage should read ≈100% at r=150 (the final swell radius).
