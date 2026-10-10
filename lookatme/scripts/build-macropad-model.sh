#!/bin/sh
# Rebuilds public/models/macropad.glb from the KiCad STEP export plus the
# parts and colours KiCad's export drops. Library paths are from the author's machine.
L="/Users/ysabhiram/Desktop/Personal_Projects/KiCAD/scottokeebs-main/Extras/ScottoKicad/3dmodels"
node scripts/convert-step.mjs Macropad-mk2.step public/models/macropad.glb \
  --palette "MX_PCB=$L/ScottoKeebs_MX.3dshapes/MX_PCB.step" \
  --palette "Diode_DO-35=$L/ScottoKeebs_Components.3dshapes/Diode_DO-35.step" \
  --part "$L/ScottoKeebs_MCU.3dshapes/Seeed_XIAO_RP2040.step,99.59,74.76,180,back" --name "XIAO RP2040"
