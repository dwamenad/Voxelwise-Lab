import type { Metadata } from "next";
import { DesignMatrixVisualizer } from "@/components/tools/design-matrix-visualizer";
import { FSLCommandGenerator } from "@/components/tools/fsl-command-generator";

export const metadata: Metadata = {
  title: "Interactive Neuroimaging Lab Tools | Voxelwise Lab",
  description: "Simulate GLM design matrices, validate contrast vectors, and construct error-free FSL commands.",
};

export default function ToolsPage() {
  return (
    <main className="page-shell max-w-5xl mx-auto px-4 py-8 space-y-12">
      <header className="page-intro space-y-2">
        <span className="eyebrow">Interactive Workbench</span>
        <h1 className="text-3xl font-extrabold text-[var(--ink)]">Neuroimaging Lab Tools</h1>
        <p className="text-base text-[var(--ink-secondary)] max-w-2xl">
          Visual simulators and command generators to bridge conceptual understanding with terminal and FEAT execution.
        </p>
      </header>

      <section className="space-y-6">
        <DesignMatrixVisualizer />
      </section>

      <section className="space-y-6">
        <FSLCommandGenerator />
      </section>
    </main>
  );
}
