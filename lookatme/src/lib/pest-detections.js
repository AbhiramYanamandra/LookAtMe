/**
 * Real RT-DETR output on the AgroPest-12 test set, from the project's testing
 * notebook (15-epoch checkpoint, confidence ≥ 0.1, NMS 0.1).
 *
 * Each image is a test-set photo. `pred` boxes are the model's predictions,
 * recovered from the notebook's rendered output and redrawn as vectors; `gt`
 * boxes are the dataset's labels. Boxes are [x0, y0, x1, y1] as fractions of
 * the image. `iou` compares each prediction with its matching label.
 */
export const DETECTIONS = [
  {
    id: "ants",
    truth: "Ants",
    pred: [
      { label: "Ants", box: [0.417, 0.258, 0.752, 0.563], iou: 0.75 },
      { label: "Ants", box: [0.139, 0.493, 0.546, 0.9], iou: 0.63 },
      { label: "Ants", box: [0.602, 0.546, 0.907, 0.891], iou: 0.69 },
    ],
    gt: [
      [0.377, 0.267, 0.762, 0.527],
      [0.14, 0.536, 0.488, 0.833],
      [0.564, 0.527, 0.898, 0.83],
    ],
  },
  {
    id: "caterpillar",
    truth: "Caterpillars",
    pred: [{ label: "Caterpillars", box: [0.226, 0.109, 0.783, 0.852], iou: 0.92 }],
    gt: [[0.235, 0.108, 0.768, 0.884]],
  },
  {
    id: "weevil",
    truth: "Weevils",
    pred: [{ label: "Weevils", box: [0.328, 0.132, 0.821, 0.79], iou: 0.85 }],
    gt: [[0.323, 0.134, 0.866, 0.83]],
  },
  {
    id: "snail",
    truth: "Snails",
    pred: [{ label: "Snails", box: [0.37, 0.241, 0.865, 0.68], iou: 0.8 }],
    gt: [[0.391, 0.257, 0.932, 0.691]],
  },
  {
    id: "grasshopper",
    truth: "Grasshoppers",
    pred: [{ label: "Grasshoppers", box: [0.23, 0.498, 0.739, 0.795], iou: 0.76 }],
    gt: [[0.171, 0.511, 0.75, 0.764]],
  },
  {
    id: "beetle",
    truth: "Beetles",
    pred: [{ label: "Earwigs", box: [0.07, 0.18, 0.904, 0.965], iou: 0.56 }],
    gt: [[0.242, 0.21, 0.794, 0.876]],
  },
];

export const detectionSrc = (id, small = false) => `/images/pest/${id}${small ? "-sm" : ""}.jpg`;

export const CLASSES = ["Ants", "Bees", "Beetles", "Caterpillars", "Earthworms", "Earwigs", "Grasshoppers", "Moths", "Slugs", "Snails", "Wasps", "Weevils"];

/**
 * Test-set confusion matrix from the same run. Rows are the true class, columns
 * the predicted class followed by FN (labelled object, no detection). The last
 * row is FP (detection with no matching label).
 */
export const CONFUSION = [
  [57, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 29],
  [2, 12, 18, 0, 0, 0, 1, 1, 0, 0, 0, 0, 10],
  [0, 1, 37, 0, 0, 1, 0, 0, 0, 0, 0, 2, 3],
  [0, 0, 1, 46, 12, 0, 0, 0, 3, 0, 0, 0, 31],
  [0, 0, 0, 1, 24, 0, 0, 0, 0, 0, 0, 0, 15],
  [1, 0, 12, 0, 0, 40, 1, 0, 0, 0, 0, 0, 19],
  [1, 0, 0, 1, 0, 0, 28, 0, 0, 0, 0, 0, 25],
  [0, 0, 1, 0, 0, 0, 1, 44, 0, 0, 0, 0, 1],
  [0, 0, 1, 0, 0, 0, 0, 0, 36, 2, 0, 0, 12],
  [0, 0, 0, 0, 0, 0, 0, 0, 2, 45, 0, 0, 3],
  [1, 1, 28, 0, 0, 0, 2, 0, 0, 0, 4, 0, 11],
  [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 56, 1],
];
export const FALSE_POSITIVES = [7, 1, 23, 8, 19, 3, 1, 0, 6, 3, 0, 3];

/** Off-diagonal cells the write-up discusses: [true row, predicted column]. */
export const NOTABLE = [
  [10, 2],
  [1, 2],
  [5, 2],
  [3, 4],
];
