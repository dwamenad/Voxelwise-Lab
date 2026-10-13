"use client";

import { useState } from "react";
import { Terminal, Copy, Check } from "lucide-react";

type FSLTool = "fslmaths" | "fslstats" | "flirt" | "feat";

export function FSLCommandGenerator() {
  const [activeTool, setActiveTool] = useState<FSLTool>("fslmaths");
  const [copied, setCopied] = useState(false);

  // fslmaths state
  const [mathsInput, setMathsInput] = useState("filtered_func_data.nii.gz");
  const [mathsOp, setMathsOp] = useState<"-Tmean" | "-Tstd" | "-thr" | "-bin" | "-mas" | "-s">("-Tmean");
  const [mathsArg, setMathsArg] = useState("");
  const [mathsOutput, setMathsOutput] = useState("mean_func.nii.gz");

  // fslstats state
  const [statsInput, setStatsInput] = useState("filtered_func_data.nii.gz");
  const [statsFlag, setStatsFlag] = useState<"-M" | "-m" | "-V" | "-r" | "-R" | "-P" | "-s">("-M");
  const [statsMask, setStatsMask] = useState("mask.nii.gz");
  const [statsUseMask, setStatsUseMask] = useState(true);

  // flirt state
  const [flirtIn, setFlirtIn] = useState("example_func.nii.gz");
  const [flirtRef, setFlirtRef] = useState("highres.nii.gz");
  const [flirtDof, setFlirtDof] = useState("6");
  const [flirtCost, setFlirtCost] = useState("corratio");
  const [flirtWmseg, setFlirtWmseg] = useState("highres_wmseg.nii.gz");
  const [flirtInit, setFlirtInit] = useState("example_func2highres_init.mat");
  const flirtOmat = "example_func2highres.mat";
  const flirtOut = "example_func2highres.nii.gz";

  // feat state
  const [featDesign, setFeatDesign] = useState("design.fsf");

  // Generate command strings
  let generatedCommand = "";
  let flagExplanation: { flag: string; description: string }[] = [];

  if (activeTool === "fslmaths") {
    let opPart = mathsOp as string;
    if (mathsOp === "-thr" || mathsOp === "-s") {
      opPart = `${mathsOp} ${mathsArg || (mathsOp === "-thr" ? "100" : "2.5")}`;
    } else if (mathsOp === "-mas") {
      opPart = `-mas ${mathsArg || "mask.nii.gz"}`;
    }
    generatedCommand = `fslmaths ${mathsInput} ${opPart} ${mathsOutput}`;

    flagExplanation = [
      { flag: mathsInput, description: "Input 3D or 4D NIfTI neuroimaging volume." },
      {
        flag: mathsOp,
        description:
          mathsOp === "-Tmean"
            ? "Computes the mean intensity across the 4th dimension (time)."
            : mathsOp === "-Tstd"
            ? "Computes the standard deviation across time."
            : mathsOp === "-thr"
            ? "Zeroes all voxel intensities strictly below the specified threshold."
            : mathsOp === "-bin"
            ? "Binarizes the image (all non-zero voxels become 1)."
            : mathsOp === "-mas"
            ? "Masks input by multiplying voxels with the provided binary ROI mask."
            : "Applies 3D Gaussian spatial smoothing with specified sigma (mm).",
      },
      { flag: mathsOutput, description: "Output NIfTI destination file." },
    ];
  } else if (activeTool === "fslstats") {
    const maskPart = statsUseMask ? `-k ${statsMask} ` : "";
    const flagPart = statsFlag === "-P" ? "-P 95" : statsFlag;
    generatedCommand = `fslstats ${statsInput} ${maskPart}${flagPart}`;

    flagExplanation = [
      { flag: statsInput, description: "Target statistical or anatomical volume." },
      ...(statsUseMask
        ? [{ flag: `-k ${statsMask}`, description: "Restricts all calculations strictly inside voxels where mask > 0." }]
        : []),
      {
        flag: flagPart,
        description:
          statsFlag === "-P"
            ? "Outputs the requested percentile of the selected voxels."
            : statsFlag === "-M"
            ? "Outputs the mean of all non-zero voxels."
            : statsFlag === "-m"
            ? "Outputs the mean of all voxels including zero-valued background."
            : statsFlag === "-V"
            ? "Outputs voxel count and total volume in cubic millimeters (mm³)."
            : statsFlag === "-r"
            ? "Outputs the robust intensity range, reducing the influence of extreme values."
            : statsFlag === "-R"
            ? "Outputs the absolute minimum and maximum intensities."
            : "Outputs standard deviation of masked intensities.",
      },
    ];
  } else if (activeTool === "flirt") {
    const outPart = ` -out ${flirtOut}`;
    const bbrPart = flirtCost === "bbr"
      ? ` -wmseg ${flirtWmseg} -init ${flirtInit} -schedule "$FSLDIR/etc/flirtsch/bbr.sch"`
      : "";
    generatedCommand = `flirt -in ${flirtIn} -ref ${flirtRef} -dof ${flirtCost === "bbr" ? "6" : flirtDof} -cost ${flirtCost}${bbrPart} -omat ${flirtOmat}${outPart}`;

    flagExplanation = [
      { flag: `-in ${flirtIn}`, description: "Input image to be transformed." },
      { flag: `-ref ${flirtRef}`, description: "Reference image defining the target space and grid." },
      {
        flag: `-dof ${flirtDof}`,
        description:
          flirtDof === "6"
            ? "6 degrees of freedom: Rigid-body (3 translations, 3 rotations). Recommended for within-subject functional-to-structural."
            : "12 degrees of freedom: Full affine (translations, rotations, scale, skew). Recommended for structural-to-standard (MNI152).",
      },
      {
        flag: `-cost ${flirtCost}`,
        description:
          flirtCost === "bbr"
            ? "Boundary-Based Registration: aligns functional cortical ribbon with WM/GM boundary from T1."
            : "Correlation Ratio cost function: standard cross-contrast alignment metric.",
      },
      ...(flirtCost === "bbr" ? [
        { flag: `-wmseg ${flirtWmseg}`, description: "White-matter segmentation in the reference T1 space. Create it from the structural image before running BBR." },
        { flag: `-init ${flirtInit}`, description: "Initial functional-to-structural alignment matrix, produced by an initial 6 DOF registration." },
        { flag: "-schedule $FSLDIR/etc/flirtsch/bbr.sch", description: "FSL's BBR optimization schedule. For a complete automated workflow, use epi_reg with the full and brain-extracted T1 images." },
      ] : []),
      { flag: `-omat ${flirtOmat}`, description: "4×4 affine transformation matrix file (.mat)." },
    ];
  } else if (activeTool === "feat") {
    generatedCommand = `feat ${featDesign}`;
    flagExplanation = [
      { flag: "feat", description: "FSL FMRI Expert Analysis Tool executable." },
      { flag: featDesign, description: "FEAT setup file specifying all model, registration, and filtering options." },
    ];
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(generatedCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="fsl-command-gen border border-[var(--border)] rounded-xl bg-[var(--surface)] p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-1">
          <Terminal size={15} /> FSL CLI Workbench
        </div>
        <h2 className="text-xl font-bold text-[var(--ink)]">FSL Command Generator</h2>
        <p className="text-sm text-[var(--ink-secondary)]">
          Construct production-ready, scientifically defensible FSL commands with parameter breakdowns and guidance.
        </p>
      </div>

      {/* Tool Selector Tabs */}
      <div className="flex border-b border-[var(--border)] gap-2 overflow-x-auto pb-px">
        {(["fslmaths", "fslstats", "flirt", "feat"] as FSLTool[]).map((tool) => (
          <button
            key={tool}
            type="button"
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTool === tool
                ? "border-[var(--ink)] text-[var(--ink)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
            onClick={() => setActiveTool(tool)}
          >
            {tool}
          </button>
        ))}
      </div>

      {/* Tool Config Controls */}
      <div className="p-4 bg-[var(--surface-sunken)] rounded-xl border border-[var(--border)] space-y-4">
        {activeTool === "fslmaths" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Input Image</label>
              <input
                type="text"
                value={mathsInput}
                onChange={(e) => setMathsInput(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-3 py-1.5 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Mathematical Operation</label>
              <select
                value={mathsOp}
                aria-label="Mathematical Operation"
                onChange={(e) => setMathsOp(e.target.value as typeof mathsOp)}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-3 py-1.5 text-xs font-mono"
              >
                <option value="-Tmean">-Tmean (Temporal Mean)</option>
                <option value="-Tstd">-Tstd (Temporal Std Dev)</option>
                <option value="-thr">-thr (Intensity Threshold)</option>
                <option value="-bin">-bin (Binarize Non-Zero)</option>
                <option value="-mas">-mas (Apply Mask)</option>
                <option value="-s">-s (Gaussian Smoothing)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Output Image</label>
              <input
                type="text"
                value={mathsOutput}
                onChange={(e) => setMathsOutput(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-3 py-1.5 font-mono text-xs"
              />
            </div>
            {["-thr", "-s", "-mas"].includes(mathsOp) && (
              <label className="text-xs text-[var(--muted)] block">{mathsOp === "-mas" ? "Mask image" : mathsOp === "-s" ? "Smoothing sigma (mm)" : "Intensity threshold"}
                <input type="text" value={mathsArg} onChange={(e) => setMathsArg(e.target.value)} placeholder={mathsOp === "-mas" ? "mask.nii.gz" : mathsOp === "-s" ? "2.5" : "100"} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-3 py-1.5 font-mono mt-1" />
              </label>
            )}
          </div>
        )}

        {activeTool === "fslstats" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Target Volume</label>
              <input
                type="text"
                value={statsInput}
                onChange={(e) => setStatsInput(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-3 py-1.5 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Metric Flag</label>
              <select
                value={statsFlag}
                aria-label="Metric Flag"
                onChange={(e) => setStatsFlag(e.target.value as typeof statsFlag)}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-3 py-1.5 text-xs font-mono"
              >
                <option value="-M">-M (Mean of Non-Zero Voxels)</option>
                <option value="-m">-m (Mean of All Voxels)</option>
                <option value="-V">-V (Voxel Count & Volume mm³)</option>
                <option value="-r">-r (Robust Range)</option>
                <option value="-R">-R (Absolute Min/Max)</option>
                <option value="-s">-s (Standard Deviation)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Restrict with ROI Mask</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={statsUseMask}
                  onChange={(e) => setStatsUseMask(e.target.checked)}
                  className="accent-[var(--accent)]"
                />
                <input
                  type="text"
                  disabled={!statsUseMask}
                  value={statsMask}
                  onChange={(e) => setStatsMask(e.target.value)}
                  className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded px-2 py-1 font-mono text-xs disabled:opacity-40"
                />
              </div>
            </div>
          </div>
        )}

        {activeTool === "flirt" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Input Image (-in)</label>
              <input
                type="text"
                value={flirtIn}
                onChange={(e) => setFlirtIn(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-2.5 py-1.5 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Reference Space (-ref)</label>
              <input
                type="text"
                value={flirtRef}
                onChange={(e) => setFlirtRef(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-2.5 py-1.5 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Degrees of Freedom (-dof)</label>
              <select
                value={flirtDof}
                disabled={flirtCost === "bbr"}
                onChange={(e) => setFlirtDof(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs font-mono"
              >
                <option value="6">6 DOF (Rigid Body / Within-subject)</option>
                <option value="12">12 DOF (Affine / Structural to Template)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Cost Function (-cost)</label>
              <select
                value={flirtCost}
                aria-label="Cost Function"
                onChange={(e) => { setFlirtCost(e.target.value); if (e.target.value === "bbr") setFlirtDof("6"); }}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs font-mono"
              >
                <option value="bbr">bbr (Boundary-Based Registration)</option>
                <option value="corratio">corratio (Correlation Ratio)</option>
                <option value="mutualinfo">mutualinfo (Mutual Information)</option>
              </select>
            </div>
            {flirtCost === "bbr" && <>
              <label className="text-xs text-[var(--muted)] block">White-matter segmentation (-wmseg)
                <input type="text" value={flirtWmseg} onChange={(e) => setFlirtWmseg(e.target.value)} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-2.5 py-1.5 font-mono mt-1" />
              </label>
              <label className="text-xs text-[var(--muted)] block">Initial alignment matrix (-init)
                <input type="text" value={flirtInit} onChange={(e) => setFlirtInit(e.target.value)} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-2.5 py-1.5 font-mono mt-1" />
              </label>
            </>}
          </div>
        )}

        {activeTool === "feat" && (
          <div className="text-sm">
            <label className="text-xs text-[var(--muted)] block mb-1">Design Specification File (.fsf)</label>
            <input
              type="text"
              value={featDesign}
              onChange={(e) => setFeatDesign(e.target.value)}
              className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded px-3 py-1.5 font-mono text-xs"
            />
          </div>
        )}
      </div>

      {/* Generated Terminal Output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-[var(--ink-secondary)]">
          <span>Executable Command</span>
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--ink)] hover:text-[var(--accent)] transition-colors"
            onClick={handleCopy}
          >
            {copied ? <Check size={14} className="text-[var(--success)]" /> : <Copy size={14} />}
            {copied ? "Copied to clipboard" : "Copy command"}
          </button>
        </div>

        <div className="p-4 bg-[var(--surface-sunken)] rounded-xl border border-[var(--border)] font-mono text-sm overflow-x-auto text-[var(--ink)] select-all">
          <code>{generatedCommand}</code>
        </div>
      </div>

      {/* Parameter Breakdown */}
      <div className="space-y-2 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
          Parameter Breakdown & Neurodesk Context
        </h4>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {flagExplanation.map((item, idx) => (
            <div key={idx} className="p-2.5 bg-[var(--surface-sunken)] rounded border border-[var(--border)]/60">
              <dt className="font-mono font-bold text-[var(--ink)] mb-0.5">{item.flag}</dt>
              <dd className="text-[var(--ink-secondary)]">{item.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
