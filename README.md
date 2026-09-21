# LIBERO-VPro project website

Static project page for **LIBERO-VPro: Benchmarking Closed-Loop Visual Robustness of Robotic Foundation Models**.

## Preview locally

Run from this directory:

```bash
python3 -m http.server 8000
```

Then open `http://127.0.0.1:8000/`. No build step is required; this directory can be published directly with GitHub Pages.

## Media policy

- All paper figures are displayed at their native aspect ratio (`width: 100%; height: auto`).
- Real-world videos use the complete 16:9 third-person camera frame at 960×540. The first 3 seconds are trimmed uniformly and playback is accelerated to 2×; the frame itself is not cropped or stretched.
- Each recording is provided as H.264 MP4 with a VP9 WebM fallback.
- Videos pause when they leave the viewport and remain user-controllable.

## Current real-world videos

- Same-position distractor on Pick-and-Place: π0.5 success and LaWAM failure.
- Third-person camera staleness on Move: π0.5 success and LaWAM failure.

## Simulation videos

The twelve benchmark categories each include a representative dual-view model-input video selected from the recorded evaluation outputs. Each simulation clip is provided as H.264 MP4 with a VP9 WebM fallback and is displayed at a 2:1 aspect ratio. Clips within one diagnostic dimension share a task instruction, while models and evaluation runs may vary; different dimensions do not need to use the same task. View-dependent perturbations are labeled explicitly as third-person, wrist, or both-camera interventions.

- Visual Evidence Degradation: `Put the bowl on the plate.`, π0.5. View Unavailability pairs a wrist-camera blackout with a third-person-camera blackout under the same task and initial state. Interaction-Cue Masking uses a visibly failed rollout that ends with the bowl and plate separated. Temporary Observation Corruption uses a separate early reach-phase rollout with its original timing preserved.
- Camera Staleness: π0.5, with separate Delay-3, Freeze, and Replay examples on the third-person camera.
- Visual Source Consistency: `Put the bowl on the plate.`, using FastWAM for cross-view contradiction and LingBot-VLA for recursive self-prediction.
- Task-Relevant Scene Variation: `Pick up the alphabet soup and place it in the basket.`, π0.5. The distractor rollout shows the policy grasping the same-position yellow block instead of the soup; Task-Precondition Variation uses a failed rollout in which the side-lying soup remains on the table; Target Geometry Variation uses a high-severity twist with a pronounced multi-layered contour in the wrist close-up.

Each clip is labeled with its outcome taken from the corresponding episode record (`summary.success`).

## Project structure

```text
.
├── index.html
├── assets/
│   ├── LIBERO-VPro.pdf
│   ├── css/site.css
│   ├── js/site.js
│   ├── images/
│   └── videos/
└── README.md
```

BibTeX is intentionally omitted from this version.
